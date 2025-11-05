import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeMail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Chào mừng bạn đến với HealthCare!',
      template: './welcome',
      context: { name },
    });
  }

  async sendOTP(to: string, otp: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Mã xác thực tài khoản của bạn',
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`,
    });
  }
}
