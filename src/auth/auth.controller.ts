import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { AccessTokenResponse } from '../shared/jwt/protocols/interfaces/access-token-response.interface';
import { Request } from 'express';
import { JwtRefreshGuard } from 'src/shared/jwt/guards/jwt-refresh-auth-guard';
import { RefreshTokenResponse } from 'src/shared/jwt/protocols/interfaces/refresh-token-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() userDto: LoginUserDTO): Promise<AccessTokenResponse> {
    return await this.authService.loginUser(userDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  async refreshToken(@Req() req: Request): Promise<RefreshTokenResponse> {
    const id: number = req.user['id'];
    const refreshToken: string = req.user['refreshToken'];
    return await this.authService.refreshToken(id, refreshToken);
  }
}
