/**
 * RabbitMQ Event Types for Tip Ledger
 */
export enum TipEventType {
  TIP_INTENT_CREATED = 'TIP_INTENT_CREATED',
  TIP_CONFIRMED = 'TIP_CONFIRMED',
  TIP_REVERSED = 'TIP_REVERSED',
}

/**
 * Base event payload interface
 */
export interface TipEventPayload {
  eventId: string; // Unique event ID for idempotency
  eventType: TipEventType;
  timestamp: Date;
  data: TipIntentEventData;
}

/**
 * Tip intent data in events
 */
export interface TipIntentEventData {
  tipIntentId: string;
  merchantId: string;
  employeeId?: string;
  tableQRId: string;
  tableCode?: string;
  amount: number;
  status: string;
  idempotencyKey: string;
  confirmedAt?: Date;
  reversedAt?: Date;
}
