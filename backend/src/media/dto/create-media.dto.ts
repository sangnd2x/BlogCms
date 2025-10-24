import { IsEnum, IsString } from 'class-validator';
import { MediaTypeEnum } from '@prisma/client';

export class CreateMediaDto {
  @IsString()
  url: string;

  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsEnum(MediaTypeEnum)
  type: MediaTypeEnum;
}
