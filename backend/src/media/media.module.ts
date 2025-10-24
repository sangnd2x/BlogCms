import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioService } from '../minio/minio.service';

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, MinioService],
})
export class MediaModule {}
