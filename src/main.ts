import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ensureDatabaseExists } from './core/database/ensure-database';
import { AppLoggerService } from './core/logger/logger.service';

loadEnv();

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await ensureDatabaseExists();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Database Bootstrap] ${message}`);
      throw error;
    }
  }
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = app.get(AppLoggerService);

  app.useLogger(logger);
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: parseAllowedOrigins(configService.get<string>('app.allowedOrigins')),
    credentials: true,
  });
  const globalPrefix = configService.get<string>('app.globalPrefix', '');
  if (globalPrefix.trim()) {
    app.setGlobalPrefix(globalPrefix);
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  setupSwagger(app, configService);

  app.enableShutdownHooks();
  await app.listen(configService.get<number>('app.port', 4000));
  logger.log(`API listening on ${normalizeBootstrapUrl(await app.getUrl())}`, 'Bootstrap');
}

function parseAllowedOrigins(value: string | undefined): true | string[] {
  if (!value?.trim()) {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeBootstrapUrl(url: string): string {
  return url.replace('http://[::1]:', 'http://localhost:');
}

void bootstrap();
