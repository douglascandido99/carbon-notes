import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/repository/users-repository';
import { LoginUserDTO } from './dto/login-user.dto';
import * as argon from 'argon2';
import { AccessTokenPayload } from '../shared/jwt/protocols/interfaces/access-token-payload.interface';
import { AccessTokenResponse } from '../shared/jwt/protocols/interfaces/access-token-response.interface';
import { JwtRepository } from '../shared/jwt/repository/jwt-repository';
import { User } from '@prisma/client';
import { RefreshTokenPayload } from 'src/shared/jwt/protocols/interfaces/refresh-token-payload.interface';
import { RefreshTokenResponse } from 'src/shared/jwt/protocols/interfaces/refresh-token-response.interface';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

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
        const accessTokenPayload: AccessTokenPayload = {
          id: user.id,
          email: user.email,
        };

        try {
          const [accessToken, refreshToken] = await Promise.all([
            this.jwt.createAccessToken(accessTokenPayload),
            this.jwt.createRefreshToken(accessTokenPayload),
          ]);

          const refreshTokenHash: string = await argon.hash(refreshToken);

          await this.user.updateUser(user.id, {
            refreshToken: refreshTokenHash,
          });

          return {
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
        } catch (error) {
          throw new InternalServerErrorException('Failed to login');
        }
    }
  }

  async refreshToken(
    id: number,
    token: RefreshTokenDTO,
  ): Promise<RefreshTokenResponse> {
    const user: User = await this.user.findUserById(id);

    switch (true) {
      case !user || !user.refreshToken:
        throw new ForbiddenException('Access denied');
      case !(await argon.verify(user.refreshToken, token.refreshToken)):
        throw new ForbiddenException('Refresh token malformed');
      default:
        const refreshTokenPayload: RefreshTokenPayload = {
          id: user.id,
          email: user.email,
        };

        try {
          const [accessToken, refreshToken] = await Promise.all([
            this.jwt.createAccessToken(refreshTokenPayload),
            this.jwt.createRefreshToken(refreshTokenPayload),
          ]);

          const refreshTokenHash: string = await argon.hash(refreshToken);

          await this.user.updateUser(user.id, {
            refreshToken: refreshTokenHash,
          });

          return {
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
        } catch (error) {
          throw new InternalServerErrorException('Failed to refresh token');
        }
    }
  }
}
