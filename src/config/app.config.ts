import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'Sidago CRM Backend',
  version: process.env.APP_VERSION ?? '1.0.0',
  port: Number(process.env.PORT ?? 4000),
  globalPrefix: process.env.GLOBAL_PREFIX ?? 'api',
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000',
  cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  trustProxy: process.env.APP_TRUST_PROXY === 'true',
}));
