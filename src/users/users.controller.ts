import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mail: MailService,
  ) {}

  @Post('create')
  async create(@Body() userDto: CreateUserDTO): Promise<void> {
    await this.usersService.createUser(userDto);
    await this.mail.sendEmailValidationLink(userDto.email);
  }
}
