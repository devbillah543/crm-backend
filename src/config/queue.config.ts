import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  prefix: process.env.QUEUE_PREFIX ?? 'sidago',
  defaultAttempts: Number(process.env.QUEUE_DEFAULT_ATTEMPTS ?? 3),
  defaultBackoff: Number(process.env.QUEUE_DEFAULT_BACKOFF ?? 5000),
  concurrency: Number(process.env.QUEUE_CONCURRENCY ?? 5),
}));
