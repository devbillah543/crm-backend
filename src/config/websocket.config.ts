import { registerAs } from '@nestjs/config';

export default registerAs('websocket', () => ({
  corsOrigin: process.env.WS_CORS_ORIGIN ?? process.env.FRONTEND_URL ?? '*',
}));
