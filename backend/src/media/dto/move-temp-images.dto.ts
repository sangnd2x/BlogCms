import { IsArray, IsString } from 'class-validator';

export class MoveTempImagesDto {
  @IsArray()
  @IsString({ each: true })
  tempImageUrls: string[];
}
