import { IsEmail, IsString } from 'class-validator';

class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}

export default CreateUserDto;
