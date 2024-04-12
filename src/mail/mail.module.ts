import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/repository/users-repository';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MailController],
  providers: [MailService, JwtService, UsersRepository],
})
export class MailModule {}
