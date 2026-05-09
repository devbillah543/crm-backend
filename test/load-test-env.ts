import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

process.env.NODE_ENV = 'test';

loadEnv({
  path: resolve(process.cwd(), '.env.test'),
  override: true,
  quiet: true,
});
