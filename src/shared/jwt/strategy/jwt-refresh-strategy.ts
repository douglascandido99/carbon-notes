import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/repository/users-repository';
import { RefreshTokenPayload } from '../protocols/interfaces/refresh-token-payload.interface';
import { User } from '@prisma/client';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly user: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_REFRESH,
    });
  }

  async validate(payload: RefreshTokenPayload): Promise<User> {
    const user: User = await this.user.findUserById(payload.id);
    if (!user) throw new NotFoundException('User not found');
    try {
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to validate refresh jwt');
    }
  }
}
