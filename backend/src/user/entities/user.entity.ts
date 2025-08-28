import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Article } from '../../article/entities/article.entity';
import { Exclude } from 'class-transformer';
import { Comment } from '../../comment/entities/comment.entity';

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

  // Article relationship
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  // Comment relationship
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
