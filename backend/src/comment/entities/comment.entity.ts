import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { Blog } from '../../blog/entities/blog.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.comments)
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  @Column()
  blog_id: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;
}
