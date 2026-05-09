import type { ConfigService } from '@nestjs/config';

export function validateProductionSafety(configService: ConfigService): void {
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  if (nodeEnv !== 'production') {
    return;
  }

  const accessSecret = configService.get<string>('jwt.accessSecret', '');
  const refreshSecret = configService.get<string>('jwt.refreshSecret', '');
  const allowedOrigins = configService.get<string>('app.allowedOrigins', '').trim();
  const mailHost = configService.get<string>('mailer.host', '').trim().toLowerCase();

  if (isPlaceholderSecret(accessSecret) || isPlaceholderSecret(refreshSecret)) {
    throw new Error(
      'Production startup blocked: JWT secrets still use placeholder values. Set strong production secrets before starting the API.',
    );
  }

  if (accessSecret === refreshSecret) {
    throw new Error(
      'Production startup blocked: JWT access and refresh secrets must be different.',
    );
  }

  if (!allowedOrigins) {
    throw new Error(
      'Production startup blocked: ALLOWED_ORIGINS must be explicitly configured.',
    );
  }

  if (mailHost === 'log') {
    throw new Error(
      'Production startup blocked: MAIL_HOST=log is only intended for local/testing environments.',
    );
  }
}

function isPlaceholderSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized.includes('replace-with') || normalized.includes('changeme');
}
