import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/repository/users-repository';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MailService, JwtService, UsersRepository],
})
export class MailModule {}
