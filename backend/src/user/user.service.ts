import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import CreateUserDto from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(payload: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const userPayload = { ...payload, password_hash: hashedPassword };
      const newUser = this.userRepository.create(userPayload);
      return this.userRepository.save(newUser);
    } catch (error) {
      console.log(error);
      //TODO: handle error
      throw new InternalServerErrorException('Failed to create user!');
    }
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }
}
