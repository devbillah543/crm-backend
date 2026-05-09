export interface JwtUser {
  userId: string;
  email: string;
  sessionId: string;
  roles?: string[];
  permissions?: string[];
}
