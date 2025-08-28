import { IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsUUID()
  article_id: string;

  @IsUUID()
  user_id: string;
}
