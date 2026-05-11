import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { AppLoggerService } from '../logger/logger.service';
import { MailerService } from '../mailer/mailer.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private mailQueue: Queue<Record<string, unknown>> | null = null;
  private notificationQueue: Queue<Record<string, unknown>> | null = null;
  private analyticsQueue: Queue<Record<string, unknown>> | null = null;
  private workers: Worker[] = [];
  private readonly fallbackRoot = join(
    process.cwd(),
    'storage',
    'runtime',
    'queue-fallback',
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
    private readonly logger: AppLoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.redisService.isEnabled()) {
      this.logger.warn(
        'Redis is not configured. Falling back to inline filesystem-backed queue processing.',
        'QueueService',
      );
      return;
    }

    const connection = {
      url: this.configService.getOrThrow<string>('redis.url'),
      connectTimeout: this.configService.get<number>(
        'redis.connectTimeoutMs',
        10000,
      ),
      maxRetriesPerRequest: this.configService.get<number>(
        'redis.maxRetriesPerRequest',
        3,
      ),
    } satisfies ConnectionOptions;
    const prefix = this.configService.get<string>('queue.prefix', 'sidago');
    const defaultJobOptions = {
      attempts: this.configService.get<number>('queue.defaultAttempts', 3),
      backoff: {
        type: 'exponential' as const,
        delay: this.configService.get<number>('queue.defaultBackoff', 5000),
      },
      removeOnComplete: 100,
      removeOnFail: 100,
    };
    const concurrency = this.configService.get<number>('queue.concurrency', 5);

    this.mailQueue = new Queue('mail', {
      connection,
      prefix,
      defaultJobOptions,
    });
    this.notificationQueue = new Queue('notifications', {
      connection,
      prefix,
      defaultJobOptions,
    });
    this.analyticsQueue = new Queue('analytics', {
      connection,
      prefix,
      defaultJobOptions,
    });

    this.workers = [
      new Worker(
        'mail',
        async (job) => {
          await this.mailerService.sendMail(
            job.data as { to: string; subject: string; html: string },
          );
          this.logger.log(
            `Mail job processed: ${job.id ?? job.name}`,
            'QueueService',
          );
        },
        { connection, prefix, concurrency },
      ),
      new Worker(
        'notifications',
        async (job) => {
          this.logger.log(
            `Processing notification job ${job.name}`,
            'QueueService',
          );
        },
        { connection, prefix, concurrency },
      ),
      new Worker(
        'analytics',
        async (job) => {
          this.logger.log(
            `Processing analytics job ${job.name}`,
            'QueueService',
          );
        },
        { connection, prefix, concurrency },
      ),
    ];
  }

  async enqueueMail(payload: Record<string, unknown>): Promise<void> {
    if (this.mailQueue) {
      await this.mailQueue.add('send-mail', payload);
      return;
    }

    await this.processInline('mail', 'send-mail', payload, async () => {
      await this.mailerService.sendMail(
        payload as { to: string; subject: string; html: string },
      );
    });
  }

  async enqueueNotification(payload: Record<string, unknown>): Promise<void> {
    if (this.notificationQueue) {
      await this.notificationQueue.add('push-notification', payload);
      return;
    }

    await this.processInline(
      'notifications',
      'push-notification',
      payload,
      async () => {
        this.logger.log(
          'Processing notification job push-notification',
          'QueueService',
        );
      },
    );
  }

  async enqueueAnalytics(payload: Record<string, unknown>): Promise<void> {
    if (this.analyticsQueue) {
      await this.analyticsQueue.add('aggregate-analytics', payload);
      return;
    }

    await this.processInline(
      'analytics',
      'aggregate-analytics',
      payload,
      async () => {
        this.logger.log(
          'Processing analytics job aggregate-analytics',
          'QueueService',
        );
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.close()));
    await Promise.all([
      this.mailQueue?.close(),
      this.notificationQueue?.close(),
      this.analyticsQueue?.close(),
    ]);
  }

  private async processInline(
    queue: string,
    name: string,
    payload: Record<string, unknown>,
    handler: () => Promise<void>,
  ): Promise<void> {
    const jobId = randomUUID();

    try {
      await handler();
      await this.persistFallbackJob(queue, jobId, {
        name,
        payload,
        mode: 'inline',
        status: 'completed',
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      await this.persistFallbackJob(queue, jobId, {
        name,
        payload,
        mode: 'inline',
        status: 'failed',
        processedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async persistFallbackJob(
    queue: string,
    jobId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const directory = join(this.fallbackRoot, queue);
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, `${jobId}.json`),
      JSON.stringify(payload, null, 2),
      'utf8',
    );
  }
}
