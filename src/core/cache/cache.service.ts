import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async remember<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
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

  async rememberVersioned<T>(
    namespace: string,
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const version = await this.getNamespaceVersion(namespace);
    return this.remember(
      this.buildVersionedKey(namespace, version, key),
      ttlSeconds,
      factory,
    );
  }

  async invalidateNamespace(namespace: string): Promise<void> {
    await this.redisService.incr(this.buildNamespaceVersionKey(namespace));
  }

  private async getNamespaceVersion(namespace: string): Promise<string> {
    const version = await this.redisService.get(
      this.buildNamespaceVersionKey(namespace),
    );
    return version ?? '1';
  }

  private buildNamespaceVersionKey(namespace: string): string {
    return `cache:version:${namespace}`;
  }

  private buildVersionedKey(
    namespace: string,
    version: string,
    key: string,
  ): string {
    return `cache:${namespace}:v${version}:${key}`;
  }
}
