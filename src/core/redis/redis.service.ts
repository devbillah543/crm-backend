import { createHash } from 'crypto';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface LocalRedisEntry {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis | null;
  private readonly fallbackRoot: string;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url', '').trim();

    this.fallbackRoot = join(
      process.cwd(),
      'storage',
      'runtime',
      'redis-fallback',
    );
    this.client = redisUrl
      ? new Redis(redisUrl, {
          keyPrefix: this.configService.get<string>(
            'redis.keyPrefix',
            'sidago:',
          ),
          connectTimeout: this.configService.get<number>(
            'redis.connectTimeoutMs',
            10000,
          ),
          maxRetriesPerRequest: this.configService.get<number>(
            'redis.maxRetriesPerRequest',
            3,
          ),
        })
      : null;
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  isUsingFallback(): boolean {
    return !this.isEnabled();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) {
      await this.writeFallbackEntry(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
      });
      return;
    }

    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      const entry = await this.readFallbackEntry(key);
      return entry?.value ?? null;
    }

    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      await rm(this.resolveFallbackPath(key), { force: true });
      return;
    }

    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    if (!this.client) {
      const currentValue = Number((await this.get(key)) ?? '0');
      const nextValue = currentValue + 1;
      await this.set(key, String(nextValue));
      return nextValue;
    }

    return this.client.incr(key);
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<boolean> {
    if (!this.client) {
      const existing = await this.readFallbackEntry(key);
      if (existing) {
        return false;
      }

      await this.writeFallbackEntry(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
      });
      return true;
    }

    const result = ttlSeconds
      ? await this.client.set(key, value, 'EX', ttlSeconds, 'NX')
      : await this.client.set(key, value, 'NX');

    return result === 'OK';
  }

  async ping(): Promise<string> {
    if (!this.client) {
      return 'FALLBACK';
    }

    return String(await this.client.ping());
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  private async readFallbackEntry(
    key: string,
  ): Promise<LocalRedisEntry | null> {
    const filePath = this.resolveFallbackPath(key);

    try {
      const raw = await readFile(filePath, 'utf8');
      const entry = JSON.parse(raw) as LocalRedisEntry;

      if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        await rm(filePath, { force: true });
        return null;
      }

      return entry;
    } catch {
      return null;
    }
  }

  private async writeFallbackEntry(
    key: string,
    entry: LocalRedisEntry,
  ): Promise<void> {
    await mkdir(this.fallbackRoot, { recursive: true });
    await writeFile(
      this.resolveFallbackPath(key),
      JSON.stringify(entry),
      'utf8',
    );
  }

  private resolveFallbackPath(key: string): string {
    return join(
      this.fallbackRoot,
      `${createHash('sha1').update(key).digest('hex')}.json`,
    );
  }
}
