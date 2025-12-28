import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Merchant } from './merchant.entity';
import { TipIntent } from './tip-intent.entity';

/**
 * TableQR entity - represents a QR code at a restaurant table
 * Belongs to a merchant
 */
@Entity('table_qrs')
@Unique(['merchantId', 'tableCode']) // Prevent duplicate table codes per merchant
@Index(['merchantId'])
export class TableQR extends BaseEntity {
  @Column({ type: 'varchar', length: 50, nullable: false })
  tableCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string; // e.g., "Main dining area", "Patio"

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Foreign key to merchant
  @Column({ type: 'uuid', nullable: false })
  merchantId: string;

  // Relationships
  @ManyToOne('Merchant', 'tableQRs', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany('TipIntent', 'tableQR')
  tipIntents: TipIntent[];
}
