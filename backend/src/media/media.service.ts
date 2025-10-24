import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMediaDto: CreateMediaDto, blogId: string) {
    return this.prisma.media.create({
      data: {
        url: createMediaDto.url,
        filename: createMediaDto.filename,
        originalName: createMediaDto.originalName,
        type: createMediaDto.type,
        blogId: blogId,
        createdBy: blogId,
      },
    });
  }

  // findAll() {
  //   return `This action returns all media`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} media`;
  // }

  // update(id: number, updateMediaDto: UpdateMediaDto) {
  //   return `This action updates a #${id} media`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} media`;
  // }
}
