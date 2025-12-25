import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('refunds')
export class Refund extends BaseEntity {
}
