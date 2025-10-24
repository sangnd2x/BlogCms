import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRoleEnum } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEnum(UserRoleEnum)
  userRole: UserRoleEnum;
}
