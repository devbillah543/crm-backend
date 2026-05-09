import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  poolMin: Number(process.env.DATABASE_POOL_MIN ?? 2),
  poolMax: Number(process.env.DATABASE_POOL_MAX ?? 20),
}));
