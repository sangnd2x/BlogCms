import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

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

  is_deleted: boolean;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_on: Date;

  @Column({ type: 'uuid', nullable: true })
  deleted_by: string;
}
