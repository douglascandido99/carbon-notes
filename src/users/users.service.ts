import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepository } from './repository/users-repository';
import { CreateUserDTO } from './dto/create-user.dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly user: UsersRepository) {}

  async createUser(userDto: CreateUserDTO) {
    const { name, email, password } = userDto;

    const existentUser: User = await this.user.findUserByEmail(email);

    if (existentUser)
      throw new ConflictException('This e-mail is already in use');

    try {
      const hash: string = await argon.hash(password);

      await this.user.createUser({ name, email, hash });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
