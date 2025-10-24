import { IsOptional, IsString, IsEnum, IsIn, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogStatusEnum } from '@prisma/client';

export class ArticleQueryParams {
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdOn';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(BlogStatusEnum)
  status?: BlogStatusEnum;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}
