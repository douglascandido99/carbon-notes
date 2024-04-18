import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from 'src/users/repository/users-repository';
import { AccessTokenPayload } from '../protocols/interfaces/access-token-payload.interface';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly user: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<User> {
    try {
      const user: User = await this.user.findUserById(payload.id);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to validate jwt');
    }
  }
}
