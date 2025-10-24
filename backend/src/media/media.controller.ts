import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from '../minio/minio.service';
import { User } from '@prisma/client';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly minioService: MinioService,
  ) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createMediaDto: CreateMediaDto, @GetUser() user: User) {
    return this.mediaService.create(createMediaDto, user.id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      const fileUrl = await this.minioService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'blog-images',
      );

      return {
        message: 'File uploaded successfully',
        url: fileUrl,
        filename: file.originalname,
        size: file.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new BadRequestException('File upload failed');
    }
  }

  // @Get()
  // findAll() {
  //   return this.mediaService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.mediaService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
  //   return this.mediaService.update(+id, updateMediaDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.mediaService.remove(+id);
  // }
}
