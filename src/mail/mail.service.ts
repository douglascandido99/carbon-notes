import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailValidationTokenPayload } from './protocols/interfaces/email-validation-token-payload.interface';
import { UsersRepository } from 'src/users/repository/users-repository';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private readonly jwt: JwtService,
    private readonly mail: MailerService,
    private readonly user: UsersRepository,
  ) {}

  async sendEmailValidationLink(email: string): Promise<void> {
    const payload: EmailValidationTokenPayload = { email };

    try {
      const token: string = this.jwt.sign(payload, {
        secret: process.env.MAIL_VALIDATION_TOKEN_SECRET,
        expiresIn: process.env.MAIL_VALIDATION_TOKEN_EXPIRES,
      });

      const url: string = `${process.env.MAIL_VALIDATION_URL}?token=${token}`;

      const text: string = `To activate your Carbon Notes account, click on this link: ${url}`;

      await this.mail.sendMail({
        to: email,
        subject: 'Confirm your e-mail',
        text,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send e-mail validation link',
      );
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

  async decodeEmailConfirmationToken(token: string): Promise<any> {
    try {
      const payload: any = await this.jwt.verify(token, {
        secret: process.env.MAIL_VALIDATION_TOKEN_SECRET,
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
}
