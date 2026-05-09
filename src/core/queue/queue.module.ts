import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { NotificationProcessor } from '../../jobs/processors/notification.processor';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        prefix: configService.get<string>('queue.prefix', 'sidago'),
        connection: {
          url: configService.getOrThrow<string>('redis.url'),
        },
        defaultJobOptions: {
          attempts: configService.get<number>('queue.defaultAttempts', 3),
          backoff: {
            type: 'exponential',
            delay: configService.get<number>('queue.defaultBackoff', 5000),
          },
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'mail' },
      { name: 'notifications' },
      { name: 'analytics' },
    ),
  ],
  providers: [QueueService, NotificationProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
