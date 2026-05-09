import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailerConfig from './config/mailer.config';
import queueConfig from './config/queue.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import throttleConfig from './config/throttle.config';
import websocketConfig from './config/websocket.config';
import { envValidationSchema } from './config/env.validation';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { CacheModule } from './core/cache/cache.module';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
import { MailerModule } from './core/mailer/mailer.module';
import { QueueModule } from './core/queue/queue.module';
import { RedisModule } from './core/redis/redis.module';
import { RequestContextModule } from './core/request-context/request-context.module';
import { SchedulerCoreModule } from './core/scheduler/scheduler.module';
import { StorageModule } from './core/storage/storage.module';
import { WebsocketModule } from './core/websocket/websocket.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        jwtConfig,
        mailerConfig,
        queueConfig,
        redisConfig,
        storageConfig,
        throttleConfig,
        websocketConfig,
      ],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('throttle.ttl', 60) * 1000,
            limit: configService.get<number>('throttle.limit', 100),
          },
        ],
      }),
    }),
    LoggerModule,
    RequestContextModule,
    DatabaseModule,
    RedisModule,
    CacheModule,
    QueueModule,
    SchedulerCoreModule,
    StorageModule,
    MailerModule,
    WebsocketModule,
    AuthModule,
    HealthModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
