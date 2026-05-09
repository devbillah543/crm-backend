import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  bcryptRounds: Number(process.env.AUTH_BCRYPT_ROUNDS ?? 12),
  maxFailedLogins: Number(process.env.AUTH_MAX_FAILED_LOGINS ?? 5),
  lockMinutes: Number(process.env.AUTH_LOCK_MINUTES ?? 15),
  verificationExpiresHours: Number(process.env.AUTH_VERIFICATION_EXPIRES_HOURS ?? 24),
  resetPasswordExpiresMinutes: Number(process.env.AUTH_RESET_PASSWORD_EXPIRES_MINUTES ?? 30),
  securityAlertCooldownMinutes: Number(process.env.AUTH_SECURITY_ALERT_COOLDOWN_MINUTES ?? 15),
  avatarMaxSizeBytes: Number(process.env.AUTH_AVATAR_MAX_SIZE_BYTES ?? 5_242_880),
  sessionTouchThrottleSeconds: Number(process.env.AUTH_SESSION_TOUCH_THROTTLE_SECONDS ?? 60),
}));
