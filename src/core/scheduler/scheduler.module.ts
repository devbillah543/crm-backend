import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { MaintenanceCronJob } from '../../jobs/cron/maintenance.cron';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SchedulerService, MaintenanceCronJob],
  exports: [SchedulerService],
})
export class SchedulerCoreModule {}
