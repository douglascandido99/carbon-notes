import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { UsersRepository } from './repository/users-repository';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, MailService, JwtService],
})
export class UsersModule {}
