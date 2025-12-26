import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * ProcessedEvent entity - Tracks processed RabbitMQ events for consumer idempotency
 * Ensures at-least-once delivery doesn't cause duplicate side effects
 */
@Entity('processed_events')
@Index(['eventId'], { unique: true })
@Index(['eventType'])
@Index(['processedAt'])
export class ProcessedEvent extends BaseEntity {
  // Unique event ID from the message
  @Column({ type: 'uuid', nullable: false, unique: true })
  eventId: string;

  // Type of event (TIP_INTENT_CREATED, TIP_CONFIRMED, TIP_REVERSED)
  @Column({ type: 'varchar', length: 50, nullable: false })
  eventType: string;

  // When the event was processed
  @Column({ type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  processedAt: Date;

  // Optional payload for debugging
  @Column({ type: 'jsonb', nullable: true })
  payload: any;
}
