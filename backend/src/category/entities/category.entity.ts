import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Article } from '../../article/entities/article.entity';

@Entity()
export class Category extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Article, (article) => article.category)
  articles: Article[];
}
