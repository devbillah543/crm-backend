import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { AppLoggerService } from '../../core/logger/logger.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly logger: AppLoggerService) {
    super();
  }

  async process(job: Job<Record<string, unknown>>): Promise<void> {
    this.logger.log(`Processing notification job ${job.name}`, 'NotificationProcessor');
  }
}
