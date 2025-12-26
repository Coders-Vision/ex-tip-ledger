import { Entity, Column, OneToMany, Index, Table } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Employee } from './employee.entity';
import { TableQR } from './table-qr.entity';
import { TipIntent } from './tip-intent.entity';

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

  // Relationships
  @OneToMany('Employee', 'merchant')
  employees: Employee[];

  @OneToMany('TableQR', 'merchant')
  tableQRs: TableQR[];

  @OneToMany('TipIntent', 'merchant')
  tipIntents: TipIntent[];
}
