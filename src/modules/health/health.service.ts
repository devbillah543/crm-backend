import { Injectable } from '@nestjs/common';
import { DatabaseHealthService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseHealthService: DatabaseHealthService,
    private readonly redisService: RedisService,
  ) {}

  async check(): Promise<Record<string, unknown>> {
    const [, redisStatus] = await Promise.all([
      this.databaseHealthService.check(),
      this.redisService.getClient().ping(),
    ]);

    return {
      success: true,
      message: 'Server is running',
      data: {
        app: 'ok',
        database: 'ok',
        redis: redisStatus === 'PONG' ? 'ok' : redisStatus,
      },
    };
  }
}
