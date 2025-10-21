import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_on: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_on: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Exclude()
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_on: Date;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  deleted_by: string;
}
