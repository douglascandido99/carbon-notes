import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { AccessTokenResponse } from './jwt/protocols/interfaces/access-token-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() userDto: LoginUserDTO): Promise<AccessTokenResponse> {
    return await this.authService.loginUser(userDto);
  }
}
