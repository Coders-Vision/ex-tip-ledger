import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Merchant } from './merchant.entity';
import { LedgerEntry } from './ledger-entry.entity';
import { TipIntent } from './tip-intent.entity';
import { User } from './user.entity';

/**
 * Employee entity - represents a restaurant employee who receives tips
 * Belongs to a merchant
 */
@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Foreign key to user
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  // One-to-one relationship with User
  @OneToOne(() => User, (user) => user.employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Foreign key to merchant
  @Column({ type: 'uuid', nullable: false })
  merchantId: string;

  // Relationships
  @ManyToOne('Merchant', 'employees', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany('LedgerEntry', 'employee')
  ledgerEntries: LedgerEntry[];

  @OneToMany('TipIntent', 'employee')
  tipIntents: TipIntent[];
}
