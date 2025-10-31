import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MoveTempImagesDto } from './dto/move-temp-images.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { MediaTypeEnum } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

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

  async moveTempImagesToBlog(
    blogId: string,
    moveTempImagesDto: MoveTempImagesDto,
    userId: string,
  ) {
    const { tempImageUrls } = moveTempImagesDto;
    const bucketName =
      this.configService.get<string>('MINIO_BUCKET_NAME') ?? 'blogcms-uploads';
    const publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');

    const movedImages: any[] = [];

    for (const tempUrl of tempImageUrls) {
      try {
        // Extract the object name from the URL
        // URL format: http://localhost:9000/blogcms-uploads/temp/blog-images/timestamp-filename
        const urlParts = tempUrl.split(`${bucketName}/`);
        if (urlParts.length < 2) {
          this.logger.warn(`Invalid temp image URL format: ${tempUrl}`);
          continue;
        }

        const sourceObjectName = urlParts[1];
        const destinationObjectName = `blogs/${blogId}/${sourceObjectName.split('/').pop()}`;

        // Move file in MinIO
        await this.minioService.moveFile(
          sourceObjectName,
          destinationObjectName,
        );

        // Create new URL for the moved file
        const newUrl = `${publicUrl}/${bucketName}/${destinationObjectName}`;

        // Extract filename from source
        const filename = sourceObjectName.split('/').pop() || 'unknown';

        // Create Media record in database
        await this.prisma.media.create({
          data: {
            url: newUrl,
            filename: filename,
            originalName: filename,
            type: MediaTypeEnum.IMAGE,
            blogId: blogId,
            createdBy: userId,
          },
        });

        movedImages.push({
          oldUrl: tempUrl,
          newUrl: newUrl,
        });
      } catch (error) {
        this.logger.error(`Error moving image ${tempUrl}:`, error);
        throw new BadRequestException(`Failed to move image: ${tempUrl}`);
      }
    }

    return {
      message: 'Images moved successfully',
      movedImages,
    };
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
