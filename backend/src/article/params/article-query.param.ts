import { IsOptional, IsString, IsEnum, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ArticleStatus } from '../entities/article.entity';

export class ArticleQueryParams {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsString()
  author_id?: string;

  // @IsOptional()
  // @IsArray()
  // @IsString({ each: true })
  // tags?: string[];

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
}
