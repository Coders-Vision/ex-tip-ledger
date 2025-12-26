import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TipIntent } from './tip-intent.entity';
import { Employee } from './employee.entity';

/**
 * Ledger Entry Type - CREDIT for confirmed tips, DEBIT for reversals
 */
export enum LedgerEntryType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

/**
 * LedgerEntry entity - Append-only immutable record of tip transactions
 * Rules:
 * - Exactly one CREDIT entry per confirmed tip
 * - DEBIT entries for reversals (negative amount)
 * - NO UPDATES OR DELETES allowed (enforced at service layer)
 */
@Entity('ledger_entries')
@Index(['employeeId'])
@Index(['tipIntentId'])
@Index(['createdAt'])
export class LedgerEntry extends BaseEntity {
  // Amount in KWD - positive for CREDIT, negative for DEBIT (supports 3 decimal places)
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: false })
  amount: number;

  // Type of ledger entry
  @Column({
    type: 'enum',
    enum: LedgerEntryType,
    nullable: false,
  })
  type: LedgerEntryType;

  // Optional metadata
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Foreign keys
  @Column({ type: 'uuid', nullable: false })
  tipIntentId: string;

  @Column({ type: 'uuid', nullable: false })
  employeeId: string;

  // Relationships
  @ManyToOne('TipIntent', 'ledgerEntries', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tipIntentId' })
  tipIntent: TipIntent;

  @ManyToOne('Employee', 'ledgerEntries', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
