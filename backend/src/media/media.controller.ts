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
import { User } from '../user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createMediaDto: CreateMediaDto, @GetUser() user: User) {
    return this.mediaService.create(createMediaDto, user.id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          console.log('File mimetype:', file.mimetype);
          const uploadPath = file.mimetype.startsWith('video/')
            ? 'public/videos'
            : 'public/images';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileName =
            Date.now() + '-' + file.originalname.split(' ').join('-');
          cb(null, `${fileName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|ogg)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Check if file was uploaded
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      success: true,
      filename: file.filename,
      originalName: file.originalname,
      path: `/public/${file.mimetype.startsWith('video/') ? 'videos' : 'images'}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date().toISOString(),
    };
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
