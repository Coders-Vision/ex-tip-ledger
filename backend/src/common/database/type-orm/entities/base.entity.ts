import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A base entity class to include common fields like id, createdAt, and updatedAt.
 * Extend this class in your other entity files to reuse these fields.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz', nullable: false })
  updatedAt: Date;
}
