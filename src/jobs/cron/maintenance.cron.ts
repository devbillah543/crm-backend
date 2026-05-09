import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLoggerService } from '../../core/logger/logger.service';
import { QueueService } from '../../core/queue/queue.service';
import { SchedulerService } from '../../core/scheduler/scheduler.service';

@Injectable()
export class MaintenanceCronJob {
  constructor(
    private readonly schedulerService: SchedulerService,
    private readonly queueService: QueueService,
    private readonly logger: AppLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'maintenance-dispatch' })
  async handle(): Promise<void> {
    const locked = await this.schedulerService.acquireLock('cron:maintenance-dispatch', 540);
    if (!locked) {
      return;
    }

    this.logger.log('Dispatching maintenance background tasks', 'MaintenanceCronJob');
    await this.queueService.enqueueAnalytics({ job: 'rebuild-dashboard-snapshots' });
  }
}
