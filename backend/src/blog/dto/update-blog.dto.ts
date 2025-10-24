import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
