import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Article } from '../../article/entities/article.entity';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity()
export class Media extends BaseEntity {
  @Column()
  url: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @ManyToOne(() => Article, (article) => article.medias)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Column({ type: 'uuid' })
  article_id: string;
}
