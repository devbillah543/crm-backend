export interface JwtAccessPayload {
  sub: string;
  email: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  type: 'access';
}
