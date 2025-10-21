import { IsOptional, IsString, IsEnum, IsIn, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogStatus } from '../entities/blog.entity';

export class ArticleQueryParams {
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort_by?: string = 'created_on';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsString()
  author_id?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  published_at?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}
