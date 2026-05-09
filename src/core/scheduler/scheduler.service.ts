import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly redisService: RedisService) {}

  async acquireLock(key: string, ttlSeconds = 60): Promise<boolean> {
    const client = this.redisService.getClient();
    const result = await client.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }
}
