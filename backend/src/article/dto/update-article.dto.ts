import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsUUID()
  updated_by: string;
}
