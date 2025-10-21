import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Blog } from '../../blog/entities/blog.entity';

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

  @ManyToOne(() => Blog, (blog) => blog.medias)
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  @Column({ type: 'uuid' })
  blog_id: string;
}
