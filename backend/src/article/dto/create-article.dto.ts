import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  featured_image?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsDateString()
  published_at?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  category_id?: string;
}
