import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Article } from '../../article/entities/article.entity';
import { Exclude } from 'class-transformer';

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

  @Exclude()
  @Column({ nullable: true })
  password_hash: string;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true })
  last_change_password: Date;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  user_role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
