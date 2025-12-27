import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import {
  TipEventType,
  TipEventPayload,
  TipIntentEventData,
} from './events.interface';

// Exchange and Queue names
export const TIP_EXCHANGE = 'tip_events';
export const TIP_EVENTS_QUEUE = 'tip_events_queue';
export const EMAIL_QUEUE = 'email_queue';

// Routing keys
export const ROUTING_KEYS = {
  TIP_INTENT_CREATED: 'tip.intent.created',
  TIP_CONFIRMED: 'tip.confirmed',
  TIP_REVERSED: 'tip.reversed',
  EMAIL: 'email.send',
};

@Injectable()
export class ProducerService implements OnModuleDestroy {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ProducerService.name);

  constructor(private configService: ConfigService) {
    const rabbitUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost',
    );
    const connection = amqp.connect([rabbitUrl]);

    connection.on('connect', () => {
      this.logger.log('Producer connected to RabbitMQ');
    });

    connection.on('disconnect', (err) => {
      this.logger.error('Producer disconnected from RabbitMQ', err);
    });

    this.channelWrapper = connection.createChannel({
      setup: async (channel: Channel) => {
        // Declare topic exchange for tip events
        await channel.assertExchange(TIP_EXCHANGE, 'topic', { durable: true });

        // Declare queues
        await channel.assertQueue(TIP_EVENTS_QUEUE, { durable: true });
        await channel.assertQueue(EMAIL_QUEUE, { durable: true });

        // Bind tip events queue to exchange with routing patterns
        await channel.bindQueue(TIP_EVENTS_QUEUE, TIP_EXCHANGE, 'tip.#');
        await channel.bindQueue(EMAIL_QUEUE, TIP_EXCHANGE, 'email.#');

        this.logger.log('Exchange and queues configured');
      },
    });
  }

  /**
   * Emit TIP_INTENT_CREATED event
   */
  async emitTipIntentCreated(data: TipIntentEventData): Promise<void> {
    const payload: TipEventPayload = {
      eventId: uuidv4(),
      eventType: TipEventType.TIP_INTENT_CREATED,
      timestamp: new Date(),
      data,
    };
    await this.publishToExchange(ROUTING_KEYS.TIP_INTENT_CREATED, payload);
    this.logger.log(
      `TIP_INTENT_CREATED event emitted for: ${data.tipIntentId}`,
    );
  }

  /**
   * Emit TIP_CONFIRMED event
   */
  async emitTipConfirmed(data: TipIntentEventData): Promise<void> {
    const payload: TipEventPayload = {
      eventId: uuidv4(),
      eventType: TipEventType.TIP_CONFIRMED,
      timestamp: new Date(),
      data,
    };
    await this.publishToExchange(ROUTING_KEYS.TIP_CONFIRMED, payload);
    this.logger.log(`TIP_CONFIRMED event emitted for: ${data.tipIntentId}`);
  }

  /**
   * Emit TIP_REVERSED event
   */
  async emitTipReversed(data: TipIntentEventData): Promise<void> {
    const payload: TipEventPayload = {
      eventId: uuidv4(),
      eventType: TipEventType.TIP_REVERSED,
      timestamp: new Date(),
      data,
    };
    await this.publishToExchange(ROUTING_KEYS.TIP_REVERSED, payload);
    this.logger.log(`TIP_REVERSED event emitted for: ${data.tipIntentId}`);
  }


  /**
   * Publish message to exchange with routing key
   */
  private async publishToExchange(
    routingKey: string,
    payload: TipEventPayload,
  ): Promise<void> {
    try {
      await this.channelWrapper.publish(
        TIP_EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );
    } catch (error) {
      this.logger.error(`Failed to publish to ${routingKey}`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.channelWrapper.close();
  }
}
