import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Merchant } from './merchant.entity';
import { Employee } from './employee.entity';

export enum UserRole {
  MERCHANT = 'merchant',
  EMPLOYEE = 'Employee',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  // One-to-one relationship with Merchant (if user is a merchant)
  @OneToOne(() => Merchant, (merchant) => merchant.user, { nullable: true })
  merchant?: Merchant;

  // One-to-one relationship with Employee (if user is an employee)
  @OneToOne(() => Employee, (employee) => employee.user, { nullable: true })
  employee?: Employee;
}
