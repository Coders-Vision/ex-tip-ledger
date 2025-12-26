import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Merchant } from './merchant.entity';
import { TableQR } from './table-qr.entity';
import { Employee } from './employee.entity';
import { LedgerEntry } from './ledger-entry.entity';

/**
 * Tip Intent Status - State machine for tip lifecycle
 */
export enum TipIntentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REVERSED = 'REVERSED',
}

/**
 * TipIntent entity - represents a tip transaction with state management
 * State machine: PENDING → CONFIRMED → REVERSED
 */
@Entity('tip_intents')
@Index(['merchantId'])
@Index(['employeeId'])
@Index(['status'])
@Index(['idempotencyKey'], { unique: true }) // Critical for idempotency
export class TipIntent extends BaseEntity {
  // Amount in KWD (supports up to 3 decimal places: 1.245 KD)
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: false })
  amount: number;

  // Status state machine
  @Column({
    type: 'enum',
    enum: TipIntentStatus,
    default: TipIntentStatus.PENDING,
    nullable: false,
  })
  status: TipIntentStatus;

  // Idempotency key - ensures same request produces same result
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  idempotencyKey: string;

  // Optional hint about which employee should receive the tip
  @Column({ type: 'varchar', length: 255, nullable: true })
  employeeHint: string;

  // Timestamps for state transitions
  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  reversedAt: Date;

  // Foreign keys
  @Column({ type: 'uuid', nullable: false })
  merchantId: string;

  @Column({ type: 'uuid', nullable: true })
  tableQRId: string;

  @Column({ type: 'uuid', nullable: true })
  employeeId: string;

  // Relationships
  @ManyToOne('Merchant', 'tipIntents', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne('TableQR', 'tipIntents', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tableQRId' })
  tableQR: TableQR;

  @ManyToOne('Employee', 'tipIntents', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @OneToMany('LedgerEntry', 'tipIntent')
  ledgerEntries: LedgerEntry[];
}
