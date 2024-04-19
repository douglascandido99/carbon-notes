import {
  Body,
  Controller,
  Param,
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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mail: MailService,
  ) {}

  @Post('create')
  async createUser(@Body() userDto: CreateUserDTO): Promise<void> {
    await this.usersService.createUser(userDto);
    await this.mail.sendEmailValidationLink(userDto.email);
  }

  @Patch('update')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userDto: UpdateUserDTO,
  ): Promise<void> {
    return await this.usersService.updateUser(id, userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-email')
  async updateEmail(
    @GetUser('id', ParseIntPipe) id: number,
    @Body() userDto: UpdateEmailDTO,
  ): Promise<void> {
    await Promise.all([
      this.usersService.initiateEmailChange(id, userDto),
      this.mail.sendChangeEmailValidationLink(userDto.pendingEmail),
    ]);
  }

  async deleteUser() {}
}
