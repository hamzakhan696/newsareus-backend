import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT') || 587),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const from = this.configService.get<string>('MAIL_FROM') || 'no-reply@newsareus.com';
    const subject = 'Reset your password';
    const html = `
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset your password. This link will expire shortly.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    await this.transporter.sendMail({ from, to, subject, html });
  }
}



