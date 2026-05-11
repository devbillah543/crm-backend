import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly redisService: RedisService) {}

  async acquireLock(key: string, ttlSeconds = 60): Promise<boolean> {
    return this.redisService.setIfNotExists(key, '1', ttlSeconds);
  }
}
