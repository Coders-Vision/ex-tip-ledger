import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import {
  TIP_EXCHANGE,
  TIP_EVENTS_QUEUE,
  EMAIL_QUEUE,
} from './producer.service';
import { TipEventPayload, TipEventType } from './events.interface';
import { ProcessedEvent } from 'src/common/database/type-orm/entities';
import { BaseRepository } from '../database/type-orm/repositories';

/**
 * Consumer Service - Handles RabbitMQ message consumption
 *
 * IDEMPOTENCY STRATEGY:
 * - Each event has a unique eventId
 * - Before processing, we check if eventId exists in processed_events table
 * - If exists, we skip processing and ACK the message (safe for at-least-once delivery)
 * - If not exists, we process and record the eventId
 * - This prevents duplicate side effects on message redelivery
 */
@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(ProcessedEvent)
    private readonly processedEventRepo: BaseRepository<ProcessedEvent>,
  ) {
    const rabbitUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost',
    );
    const connection = amqp.connect([rabbitUrl]);
    this.channelWrapper = connection.createChannel();
  }

  async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        // Ensure exchange and queues exist
        await channel.assertExchange(TIP_EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(TIP_EVENTS_QUEUE, { durable: true });
        await channel.assertQueue(EMAIL_QUEUE, { durable: true });

        // Consume tip events
        await channel.consume(TIP_EVENTS_QUEUE, async (message) => {
          if (message) {
            await this.handleTipEvent(message, channel);
          }
        });

        // Consume email events
        await channel.consume(EMAIL_QUEUE, async (message) => {});
      });
      this.logger.log(
        'Consumer service started - listening for tip and email events',
      );
    } catch (error) {
      this.logger.error('Error starting consumer service', error);
    }
  }

  /**
   * Handle tip events (TIP_INTENT_CREATED, TIP_CONFIRMED, TIP_REVERSED)
   * Safe for at-least-once delivery using idempotency check
   */
  private async handleTipEvent(
    message: any,
    channel: ConfirmChannel,
  ): Promise<void> {
    const content: TipEventPayload = JSON.parse(message.content.toString());
    const { eventId, eventType, data } = content;

    try {
      // IDEMPOTENCY CHECK: Skip if already processed
      const alreadyProcessed = await this.isEventProcessed(eventId);
      if (alreadyProcessed) {
        this.logger.log(`Event ${eventId} already processed, skipping`);
        channel.ack(message);
        return;
      }

      // Process based on event type
      switch (eventType) {
        case TipEventType.TIP_INTENT_CREATED:
          this.logger.log(
            `Processing TIP_INTENT_CREATED for tip: ${data.tipIntentId}`,
          );
          // Example: Could notify merchant, trigger webhooks, etc.
          break;

        case TipEventType.TIP_CONFIRMED:
          this.logger.log(
            `Processing TIP_CONFIRMED for tip: ${data.tipIntentId}, amount: ${data.amount}`,
          );
          // Example: Could send confirmation email to employee, update analytics, etc.
          break;

        case TipEventType.TIP_REVERSED:
          this.logger.log(
            `Processing TIP_REVERSED for tip: ${data.tipIntentId}`,
          );
          // Example: Could notify employee of reversal, update reports, etc.
          break;

        default:
          this.logger.warn(`Unknown event type: ${eventType}`);
      }

      // Mark event as processed
      await this.markEventProcessed(eventId, eventType);
      channel.ack(message);
    } catch (error) {
      this.logger.error(`Failed to process tip event ${eventId}`, error);
      // Requeue for retry (at-least-once delivery)
      channel.nack(message, false, true);
    }
  }

  /**
   * Check if event has already been processed (idempotency)
   */
  private async isEventProcessed(eventId: string): Promise<boolean> {
    const existing = await this.processedEventRepo.findOne({
      where: { eventId },
    });
    return !!existing;
  }

  /**
   * Mark event as processed
   */
  private async markEventProcessed(
    eventId: string,
    eventType: string,
  ): Promise<void> {
    const processedEvent = this.processedEventRepo.create({
      eventId,
      eventType,
      processedAt: new Date(),
    });
    await this.processedEventRepo.save(processedEvent);
  }
}
