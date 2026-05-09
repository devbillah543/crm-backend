import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;
  private readonly transportHost: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('mailer.user');
    this.transportHost = this.configService.get<string>('mailer.host', '').trim().toLowerCase();
    this.fromAddress = this.configService.get<string>(
      'mailer.from',
      'Sidago CRM <noreply@sidago.local>',
    );
    this.transporter =
      this.transportHost === 'log'
        ? null
        : nodemailer.createTransport({
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
    if (this.transportHost === 'log') {
      await this.writeMailToLog(options);
      return;
    }

    const transporter = this.transporter;
    if (!transporter) {
      throw new Error('Mailer transporter is not configured');
    }

    await transporter.sendMail({
      from: this.fromAddress,
      ...options,
    });
  }

  private async writeMailToLog(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const logsDir = join(process.cwd(), 'storage', 'logs');
    const logFile = join(logsDir, 'mail.log');
    const logEntry = {
      timestamp: new Date().toISOString(),
      from: this.fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await mkdir(logsDir, { recursive: true });
    await appendFile(logFile, `${JSON.stringify(logEntry)}\n`, 'utf8');
  }
}
