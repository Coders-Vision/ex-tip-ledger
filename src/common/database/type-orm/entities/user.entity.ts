import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';

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


  // OAuth-related fields
  @Column({ default: false })
  isOAuthUser: boolean;

  @Column({ nullable: true })
  providerId: string; // Unique ID from the OAuth provider (e.g., Google ID, Facebook ID)

  @Column({ nullable: true })
  provider: string; // The OAuth provider name (e.g., 'google', 'facebook', 'github')

  @Column({ default: true })
  active: boolean;
}
