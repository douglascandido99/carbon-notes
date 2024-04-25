import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
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
import { ConfirmEmailDTO } from './dto/confirm-email.dto';
import { ResetPasswordDTO } from 'src/auth/dto/reset-password.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { UsersRepository } from 'src/users/repository/users-repository';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly user: UsersRepository,
  ) {}

  @Post('login')
  async loginUser(@Body() userDto: LoginUserDTO): Promise<AccessTokenResponse> {
    return await this.authService.loginUser(userDto);
  }

  @Post('forgot-password')
  async requestResetPasswordLink(
    @Body() userDto: ResetPasswordDTO,
  ): Promise<void> {
    if (!(await this.user.findUserByEmail(userDto.email)))
      throw new NotFoundException('User not found');
    await this.mailService.sendResetPasswordLink(userDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() userDto: ChangePasswordDTO): Promise<void> {
    const email: any = await this.authService.decodeResetPasswordToken(
      userDto.token,
    );
    await this.authService.resetPassword(email, userDto.password);
  }

  @Post('confirm-email')
  async confirmEmail(@Body() emailDto: ConfirmEmailDTO): Promise<void> {
    const email: any = await this.authService.decodeEmailConfirmationToken(
      emailDto.token,
    );
    await this.authService.confirmEmail(email);
  }

  @Post('update-email')
  async confirmEmailUpdate(@Body() emailDto: ConfirmEmailDTO): Promise<void> {
    const email: any =
      await this.authService.decodeEmailUpdateConfirmationToken(emailDto.token);
    await this.authService.confirmEmailUpdate(email);
  }

  @Post('resend-email')
  async resendEmailConfirmationLink(
    @Body() userDto: Partial<LoginUserDTO>,
  ): Promise<void> {
    const user: User = await this.user.findUserByEmail(userDto.email);

    switch (true) {
      case !user:
        throw new NotFoundException('User not found');
      case user.isEmailVerified:
        throw new BadRequestException('Your e-mail is already confirmed');
      default:
        await this.mailService.sendEmailValidationLink(userDto.email);
    }
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
