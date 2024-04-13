import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/repository/users-repository';
import { LoginUserDTO } from './dto/login-user.dto';
import * as argon from 'argon2';
import { AccessTokenPayload } from './jwt/protocols/interfaces/access-token-payload.interface';
import { AccessTokenResponse } from './jwt/protocols/interfaces/access-token-response.interface';
import { JwtRepository } from './jwt/repository/jwt-repository';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly user: UsersRepository,
    private readonly jwt: JwtRepository,
  ) {}

  async loginUser(userDto: LoginUserDTO): Promise<AccessTokenResponse> {
    const { email, password } = userDto;

    const user: User = await this.user.findUserByEmail(email);

    switch (true) {
      case !user:
        throw new NotFoundException('User not found');
      case !user.isEmailVerified:
        throw new UnauthorizedException('You must confirm your e-mail first');
      case !(await argon.verify(user.hash, password)):
        throw new UnauthorizedException('Wrong credentials');
      default:
        try {
          const accessTokenPayload: AccessTokenPayload = {
            id: user.id,
            email: user.email,
          };

          return {
            accessToken: await this.jwt.createAccessToken(accessTokenPayload),
          };
        } catch (error) {
          throw new InternalServerErrorException('Failed to login');
        }
    }
  }
}
