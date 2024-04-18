import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '../protocols/interfaces/access-token-payload.interface';
import { RefreshTokenPayload } from '../protocols/interfaces/refresh-token-payload.interface';

@Injectable()
export class JwtRepository {
  constructor(private readonly jwt: JwtService) {}

  async createAccessToken(payload: AccessTokenPayload): Promise<string> {
    return await this.jwt.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });
  }

  async createRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return await this.jwt.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_REFRESH,
      expiresIn: process.env.ACCESS_TOKEN_REFRESH_EXPIRES,
    });
  }
}
