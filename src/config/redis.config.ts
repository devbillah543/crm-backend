import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL,
  keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'sidago:',
  connectTimeoutMs: Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 10000),
  maxRetriesPerRequest: Number(process.env.REDIS_MAX_RETRIES_PER_REQUEST ?? 3),
}));
