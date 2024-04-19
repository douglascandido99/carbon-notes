import {
  Body,
  Controller,
  Delete,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdateEmailDTO } from './dto/update-email.dto';
import { JwtAuthGuard } from 'src/shared/jwt/guards/jwt-auth-guard';
import { GetUser } from 'src/shared/decorators/get-user-decorator';
import { UpdatePasswordDTO } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mail: MailService,
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
  ) {
    return await this.usersService.updatePassword(id, userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-email')
  async updateEmail(
    @GetUser('id', ParseIntPipe) id: number,
    @Body() userDto: UpdateEmailDTO,
  ): Promise<void> {
    await Promise.all([
      this.usersService.initiateEmailChange(id, userDto),
      this.mail.sendUpdateEmailValidationLink(userDto.pendingEmail),
    ]);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteUser(@GetUser('id', ParseIntPipe) id: number): Promise<void> {
    return await this.usersService.deleteUser(id);
  }
}
