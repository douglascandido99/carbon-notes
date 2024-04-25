import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { JwtAuthGuard } from 'src/shared/jwt/guards/jwt-auth-guard';
import { GetUser } from 'src/shared/decorators/get-user-decorator';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UsersRepository } from './repository/users-repository';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mail: MailService,
    private readonly user: UsersRepository,
  ) {}

  @Post('create')
  async createUser(@Body() userDto: CreateUserDTO): Promise<void> {
    await Promise.all([
      this.usersService.createUser(userDto),
      this.mail.sendEmailValidationLink(userDto.email),
    ]);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-user')
  async updateUser(
    @GetUser('id', ParseIntPipe) id: number,
    @Body() userDto: UpdateUserDTO,
  ): Promise<void> {
    return await this.usersService.updateUser(id, userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async updatePassword(
    @GetUser('id', ParseIntPipe) id: number,
    @Body() userDto: UpdatePasswordDTO,
  ): Promise<void> {
    return await this.usersService.updatePassword(id, userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('request-email-update')
  async requestEmailUpdate(
    @GetUser('id', ParseIntPipe) id: number,
    @Body() userDto: UpdateEmailDTO,
  ): Promise<void> {
    await Promise.all([
      this.usersService.initiateEmailUpdate(id, userDto),
      this.mail.sendUpdateEmailValidationLink(userDto.pendingEmail),
    ]);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-email')
  async resendEmailUpdateLink(@Body() userDto: UpdateEmailDTO): Promise<void> {
    if (!(await this.user.findUserByPendingEmail(userDto.pendingEmail)))
      throw new NotFoundException('User not found');
    await this.mail.sendUpdateEmailValidationLink(userDto.pendingEmail);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteUser(@GetUser('id', ParseIntPipe) id: number): Promise<void> {
    return await this.usersService.deleteUser(id);
  }
}
