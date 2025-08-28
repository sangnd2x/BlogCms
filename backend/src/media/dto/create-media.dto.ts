import { IsEnum, IsString, IsUUID } from 'class-validator';
import { MediaType } from '../entities/media.entity';

export class CreateMediaDto {
  @IsString()
  url: string;

  @IsEnum(MediaType)
  media_type: MediaType;

  @IsUUID()
  article_id: number;
}
