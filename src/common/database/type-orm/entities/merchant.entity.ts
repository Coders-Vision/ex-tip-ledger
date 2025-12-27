import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Employee } from './employee.entity';
import { TableQR } from './table-qr.entity';
import { TipIntent } from './tip-intent.entity';
import { User } from './user.entity';

/**
 * Merchant entity - represents a restaurant/business
 * Root entity in the tip ledger system
 */
@Entity('merchants')
export class Merchant extends BaseEntity {
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
  @OneToOne(() => User, (user) => user.merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Relationships
  @OneToMany('Employee', 'merchant')
  employees: Employee[];

  @OneToMany('TableQR', 'merchant')
  tableQRs: TableQR[];

  @OneToMany('TipIntent', 'merchant')
  tipIntents: TipIntent[];
}
