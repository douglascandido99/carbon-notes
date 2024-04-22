import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './repository/users-repository';
import { CreateUserDTO } from './dto/create-user.dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly user: UsersRepository) {}

  async createUser(userDto: CreateUserDTO): Promise<void> {
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

  async updateUser(id: number, userDto: UpdateUserDTO): Promise<void> {
    const user: User = await this.user.findUserById(id);

    if (!user || user.id !== id) throw new NotFoundException('User not found');

    try {
      await this.user.updateUser(id, { ...userDto });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user name');
    }
  }

  async updatePassword(id: number, userDto: UpdatePasswordDTO): Promise<void> {
    const user: User = await this.user.findUserById(id);

    switch (true) {
      case !user || user.id !== id:
        throw new NotFoundException('User not found');
      case !(await argon.verify(user.hash, userDto.oldPassword)):
        throw new UnauthorizedException('Incorrect password');
      case userDto.oldPassword === userDto.newPassword:
        throw new BadRequestException(
          `My brother in Christ, this is already your current password...`,
        );
      default:
        try {
          const hash: string = await argon.hash(userDto.newPassword);
          await this.user.updateUser(id, { hash });
        } catch (error) {
          throw new InternalServerErrorException(
            'Failed to update user password',
          );
        }
    }
  }

  async initiateEmailUpdate(
    id: number,
    userDto: UpdateEmailDTO,
  ): Promise<void> {
    const user: User = await this.user.findUserById(id);

    switch (true) {
      case !user || user.id !== id:
        throw new NotFoundException('User not found');
      case user.email === userDto.pendingEmail:
        throw new BadRequestException(
          `${userDto.pendingEmail} is already your current e-mail`,
        );
      default:
        try {
          await this.user.updateUser(id, {
            pendingEmail: userDto.pendingEmail,
          });
        } catch (error) {
          throw new InternalServerErrorException('Failed to update e-mail');
        }
    }
  }

  async deleteUser(id: number) {
    const user: User = await this.user.findUserById(id);

    if (!user || user.id !== id) throw new NotFoundException('User not found');

    try {
      await this.user.deleteUser(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
