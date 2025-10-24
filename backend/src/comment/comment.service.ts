import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCommentDto: CreateCommentDto, userId: string) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        blogId: createCommentDto.blogId,
        userId: userId,
        createdBy: userId,
      },
    });

    return comment;
  }

  async findAll() {
    return this.prisma.comment.findMany({ where: { isDeleted: false } });
  }

  async findOne(id: string) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        ...(updateCommentDto.content && { content: updateCommentDto.content }),
        ...(updateCommentDto.blogId && { blogId: updateCommentDto.blogId }),
        updatedBy: userId,
        updatedOn: new Date(),
      },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy: userId,
        deletedOn: new Date(),
      },
    });
  }
}
