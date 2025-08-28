import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Article } from '../../article/entities/article.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Article, (article) => article.comments)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Column()
  article_id: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;
}
