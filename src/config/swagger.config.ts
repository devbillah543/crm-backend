import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  if (!configService.get<boolean>('SWAGGER_ENABLED', true)) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('app.name', 'Sidago CRM API'))
    .setDescription('Production-grade backend for Sidago CRM')
    .setVersion(configService.get<string>('app.version', '1.0.0'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = configService.get<string>('SWAGGER_PATH', '/');
  const normalizedPath =
    swaggerPath === '/' || swaggerPath.trim() === '' ? '' : swaggerPath.replace(/^\/+/, '');

  SwaggerModule.setup(
    normalizedPath,
    app,
    document,
  );
}
