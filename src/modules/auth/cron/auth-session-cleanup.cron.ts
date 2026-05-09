import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLoggerService } from '../../../core/logger/logger.service';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthTokenService } from '../services/auth-token.service';

@Injectable()
export class AuthSessionCleanupCron {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly authSessionService: AuthSessionService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'auth-session-cleanup' })
  async handle(): Promise<void> {
    this.logger.log('Cleaning up expired auth sessions and tokens', 'AuthSessionCleanupCron');
    await Promise.all([
      this.authSessionService.cleanup(),
      this.authTokenService.cleanup(),
    ]);
  }
}
