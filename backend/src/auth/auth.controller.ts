import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LocalAuthGuard } from './guards/local.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@Body() loginDto: User) {
    return this.authService.login(loginDto);
  }
}
