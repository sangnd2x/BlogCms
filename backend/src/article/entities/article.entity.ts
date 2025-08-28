import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { Media } from '../../media/entities/media.entity';
import { Comment } from '../../comment/entities/comment.entity';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity()
export class Article extends BaseEntity {
  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ nullable: true })
  featured_image: string;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date;

  @Column({ default: 0 })
  views_count: number;

  @Column({ default: true })
  is_active: boolean;

  // User Relationship
  @Column({ type: 'uuid' })
  author_id: string;

  @ManyToOne(() => User, (user) => user.articles, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  // Category Relationship
  @ManyToOne(() => Category, (category) => category.articles, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  // Media Relationship
  @OneToMany(() => Media, (media) => media.article)
  medias: Media[];

  // Comment Relation
  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];
}
