import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfirmEmailDTO } from './dto/confirm-email.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('confirm')
  async confirmEmail(@Body() emailDto: ConfirmEmailDTO): Promise<void> {
    const email: any = await this.mailService.decodeEmailConfirmationToken(
      emailDto.token,
    );
    await this.mailService.confirmEmail(email);
  }

  @Post('change')
  async confirmEmailUpdate(@Body() emailDto: ConfirmEmailDTO): Promise<void> {
    const email: any =
      await this.mailService.decodeEmailUpdateConfirmationToken(emailDto.token);
    await this.mailService.confirmEmailUpdate(email);
  }
}
