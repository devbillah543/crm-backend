import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('mail') private readonly mailQueue: Queue,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
  ) {}

  async enqueueMail(payload: Record<string, unknown>): Promise<void> {
    await this.mailQueue.add('send-mail', payload);
  }

  async enqueueNotification(payload: Record<string, unknown>): Promise<void> {
    await this.notificationQueue.add('push-notification', payload);
  }

  async enqueueAnalytics(payload: Record<string, unknown>): Promise<void> {
    await this.analyticsQueue.add('aggregate-analytics', payload);
  }
}
