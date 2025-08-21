import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

@Entity('user')
export class User extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_change_password: Date;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  user_role: UserRole;

  @Column({ default: true })
  is_active: boolean;
}
