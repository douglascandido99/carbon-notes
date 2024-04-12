import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersRepository } from 'src/users/repository/users-repository';
import { JwtRepository } from './jwt/repository/jwt-repository';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { JwtStrategy } from './jwt/strategy/jwt-strategy';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtRepository,
    JwtService,
    JwtStrategy,
    UsersRepository,
  ],
})
export class AuthModule {}
