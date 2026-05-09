import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.redisService.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        await this.redisService.del(key);
      }
    }

    const value = await factory();
    await this.redisService.set(key, JSON.stringify(value), ttlSeconds);
    return value;
  }
}
