import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BlogStatusEnum } from '@prisma/client';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsOptional()
  @IsEnum(BlogStatusEnum)
  status?: BlogStatusEnum;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
