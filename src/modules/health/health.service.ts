import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseHealthService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseHealthService: DatabaseHealthService,
    private readonly redisService: RedisService,
  ) {}

  async checkLiveness(): Promise<Record<string, unknown>> {
    return {
      success: true,
      message: 'Server is alive',
      data: {
        app: 'ok',
      },
    };
  }

  async checkReadiness(): Promise<Record<string, unknown>> {
    const componentStatus = {
      app: 'ok',
      database: 'error',
      redis: 'error',
    };

    try {
      await this.databaseHealthService.check();
      componentStatus.database = 'ok';
    } catch {
      componentStatus.database = 'error';
    }

    if (this.redisService.isUsingFallback()) {
      componentStatus.redis = 'fallback';
    } else {
      try {
        const redisStatus = await this.redisService.ping();
        componentStatus.redis =
          redisStatus === 'PONG' ? 'ok' : redisStatus.toLowerCase();
      } catch {
        componentStatus.redis = 'error';
      }
    }

    if (
      componentStatus.database !== 'ok' ||
      (componentStatus.redis !== 'ok' && componentStatus.redis !== 'fallback')
    ) {
      throw new ServiceUnavailableException({
        success: false,
        message: 'Server dependencies are unavailable',
        data: componentStatus,
      });
    }

    return {
      success: true,
      message: 'Server is ready',
      data: componentStatus,
    };
  }

  check(): Promise<Record<string, unknown>> {
    return this.checkReadiness();
  }
}
