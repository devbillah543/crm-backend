import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Job } from 'bullmq';
import { MailerService } from '../../core/mailer/mailer.service';
import { AppLoggerService } from '../../core/logger/logger.service';

@Injectable()
@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: AppLoggerService,
  ) {
    super();
  }

  async process(
    job: Job<{ to: string; subject: string; html: string }>,
  ): Promise<void> {
    await this.mailerService.sendMail(job.data);
    this.logger.log(`Mail job processed: ${job.id ?? job.name}`, 'MailProcessor');
  }
}
