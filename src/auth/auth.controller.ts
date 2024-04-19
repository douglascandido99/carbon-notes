import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { AccessTokenResponse } from '../shared/jwt/protocols/interfaces/access-token-response.interface';
import { JwtRefreshGuard } from 'src/shared/jwt/guards/jwt-refresh-auth-guard';
import { RefreshTokenResponse } from 'src/shared/jwt/protocols/interfaces/refresh-token-response.interface';
import { GetUser } from 'src/shared/decorators/get-user-decorator';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() userDto: LoginUserDTO): Promise<AccessTokenResponse> {
    return await this.authService.loginUser(userDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async refreshToken(
    @GetUser('id', ParseIntPipe) id: number,
    token: RefreshTokenDTO,
  ): Promise<RefreshTokenResponse> {
    return await this.authService.refreshToken(id, token);
  }
}
