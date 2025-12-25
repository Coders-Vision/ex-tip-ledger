import { Entity, Column, ManyToOne } from 'typeorm';
import { Refund } from './refund.entity';
import { BaseEntity } from './base.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity()
export class Transaction extends BaseEntity {
  // type of transaction
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  // status of the transaction
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // the monetary amount for this transaction
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  // reference to an internal/external payment provider
  @Column({ nullable: true })
  providerReference: string;



  // // optional relation to order (for payments or refunds)
  // @ManyToOne(() => Order, (order) => order.transactions, {
  //   nullable: true,
  // })
  // order: Order;

  // // optional relation to payment (for refunds)
  // @ManyToOne(() => Payment, (payment) => payment.transactions, {
  //   nullable: true,
  // })
  // payment: Payment;

  // // optional relation to refund entity
  // @ManyToOne(() => Refund, (refund) => refund.transactions, {
  //   nullable: true,
  // })
  refund: Refund;
}
