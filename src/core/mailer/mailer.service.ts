import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('mailer.user');
    this.fromAddress = this.configService.get<string>(
      'mailer.from',
      'Sidago CRM <noreply@sidago.local>',
    );
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mailer.host'),
      port: this.configService.get<number>('mailer.port', 587),
      secure: this.configService.get<boolean>('mailer.secure', false),
      auth: user
        ? {
            user,
            pass: this.configService.get<string>('mailer.pass'),
          }
        : undefined,
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      ...options,
    });
  }
}
