import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}
  async create(createCommentDto: CreateCommentDto, userId: string) {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      created_by: userId,
    });

    return await this.commentRepository.save(comment);
  }

  async findAll() {
    return this.commentRepository.find({ where: { is_deleted: false } });
  }

  async findOne(id: string) {
    return this.commentRepository.findOneBy({ id });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentRepository.update(id, {
      ...updateCommentDto,
      updated_by: userId,
      updated_on: new Date(),
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentRepository.update(id, {
      is_deleted: true,
      deleted_by: userId,
      deleted_on: new Date(),
    });
  }
}
