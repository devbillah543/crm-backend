export interface JwtRefreshPayload {
  sub: string;
  email: string;
  sessionId: string;
  tokenVersion: number;
  type: 'refresh';
}
