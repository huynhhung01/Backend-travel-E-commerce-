import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpMail(to: string, otp: string) {
    await this.mailerService.sendMail({
      from: '<huynhhungprotk01@gmail.com>',
      to,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
  }

  async sendNotificationMail(to: string, message: string) {
    await this.mailerService.sendMail({
      from: '<huynhhungprotk01@gmail.com>',
      to,
      subject: 'Notification',
      html: message,
    });
  }
}
