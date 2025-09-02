import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  user_role: UserRole;
}

export default CreateUserDto;
