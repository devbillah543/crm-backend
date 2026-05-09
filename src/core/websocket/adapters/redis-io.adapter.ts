import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import type { INestApplicationContext } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private readonly app: INestApplicationContext;

  constructor(app: INestApplicationContext) {
    super(app);
    this.app = app;
  }

  async connectToRedis(): Promise<void> {
    const configService = this.app.get(ConfigService);
    const pubClient = new Redis(configService.getOrThrow<string>('redis.url'));
    const subClient = pubClient.duplicate();
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  override createIOServer(port: number, options?: Record<string, unknown>): unknown {
    const configService = this.app.get(ConfigService);
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: configService.get<string>('websocket.corsOrigin') ?? true,
        credentials: true,
      },
    });

    if (this.adapterConstructor && 'adapter' in (server as Record<string, unknown>)) {
      (server as { adapter: (adapter: unknown) => void }).adapter(this.adapterConstructor);
    }

    return server;
  }
}
