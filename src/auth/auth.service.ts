import {
  BadRequestException,
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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly user: UsersRepository,
    private readonly jwt: JwtRepository,
    private readonly jwtService: JwtService,
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

  async resetPassword(email: string, password: string): Promise<void> {
    const user: User = await this.user.findUserByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    try {
      const hash: string = await argon.hash(password);
      await this.user.updateUser(user.id, { hash });
    } catch (error) {
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async confirmEmail(email: string): Promise<void> {
    const user: User = await this.user.findUserByEmail(email);

    if (user.isEmailVerified)
      throw new BadRequestException('E-mail already confirmed');

    await this.user.updateUser(user.id, {
      isEmailVerified: true,
    });
  }

  async confirmEmailUpdate(pendingEmail: string): Promise<void> {
    const user: User = await this.user.findUserByPendingEmail(pendingEmail);

    if (!user) throw new NotFoundException('User not found');

    try {
      await this.user.updateUser(user.id, {
        email: user.pendingEmail,
        pendingEmail: null,
        isEmailVerified: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to confirm e-mail update');
    }
  }

  async decodeEmailConfirmationToken(token: string): Promise<any> {
    try {
      const payload: any = await this.jwtService.verify(token, {
        secret: process.env.EMAIL_VALIDATION_TOKEN_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('E-mail confirmation token expired');
      }
      throw new BadRequestException('Bad e-mail confirmation token');
    }
  }

  async decodeEmailUpdateConfirmationToken(token: string): Promise<any> {
    try {
      const payload: any = await this.jwtService.verify(token, {
        secret: process.env.EMAIL_UPDATE_TOKEN_SECRET,
      });

      if (typeof payload === 'object' && 'pendingEmail' in payload) {
        return payload.pendingEmail;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('E-mail confirmation token expired');
      }
      throw new BadRequestException('Bad e-mail confirmation token');
    }
  }

  async decodeResetPasswordToken(token: string): Promise<any> {
    try {
      const payload: any = await this.jwtService.verify(token, {
        secret: process.env.EMAIL_RESET_PASSWORD_TOKEN_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Reset password token expired');
      }
      throw new BadRequestException('Bad reset password token');
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
