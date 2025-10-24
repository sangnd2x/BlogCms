import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordMatch: boolean = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: User) {
    const user = await this.userService.findUserByEmail(loginDto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = {
      username: user.email,
      sub: user.id,
      role: user.userRole,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(payload: CreateUserDto) {
    const existingUser = await this.userService.findUserByEmail(payload.email);

    if (existingUser) {
      throw new BadRequestException('User with this email existed');
    }

    const userResponse = await this.userService.create(payload);
    return this.login(userResponse.data as User);
  }
}
