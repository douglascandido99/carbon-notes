import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailValidationTokenPayload } from './protocols/interfaces/email-validation-token-payload.interface';
import { EmailUpdateValidationTokenPayload } from './protocols/interfaces/email-update-validation-token-payload.interface';
import { ResetPasswordTokenPayload } from './protocols/interfaces/reset-password-token-payload.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly jwt: JwtService,
    private readonly mail: MailerService,
  ) {}

  async sendEmailValidationLink(email: string): Promise<void> {
    const payload: EmailValidationTokenPayload = { email };

    try {
      const token: string = this.jwt.sign(payload, {
        secret: process.env.EMAIL_VALIDATION_TOKEN_SECRET,
        expiresIn: process.env.EMAIL_VALIDATION_TOKEN_EXPIRES,
      });

      const url: string = `${process.env.EMAIL_VALIDATION_URL}?token=${token}`;

      const text: string = `To confirm your e-mail, click on this link: ${url}`;

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

  async sendUpdateEmailValidationLink(pendingEmail: string): Promise<void> {
    const payload: EmailUpdateValidationTokenPayload = { pendingEmail };

    try {
      const token: string = this.jwt.sign(payload, {
        secret: process.env.EMAIL_UPDATE_TOKEN_SECRET,
        expiresIn: process.env.EMAIL_UPDATE_TOKEN_EXPIRES,
      });

      const url: string = `${process.env.EMAIL_VALIDATION_URL}?token=${token}`;

      const text: string = `To confirm your e-mail, click on this link: ${url}`;

      await this.mail.sendMail({
        to: pendingEmail,
        subject: 'Confirm your e-mail',
        text,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send e-mail update validation link',
      );
    }
  }

  async sendResetPasswordLink(email: string) {
    const payload: ResetPasswordTokenPayload = { email };

    try {
      const token: string = this.jwt.sign(payload, {
        secret: process.env.EMAIL_RESET_PASSWORD_TOKEN_SECRET,
        expiresIn: process.env.EMAIL_RESET_PASSWORD_TOKEN_EXPIRES,
      });

      const url: string = `${process.env.EMAIL_RESET_PASSWORD_URL}?token=${token}`;

      const text: string = `To reset your password, click on this link: ${url}`;

      await this.mail.sendMail({
        to: email,
        subject: 'Reset password',
        text,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send reset password link',
      );
    }
  }
}
