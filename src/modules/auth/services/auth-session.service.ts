import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User } from '../../../database/entities/user.entity';
import { UserSession } from '../../../database/entities/user-session.entity';
import type { JwtUser } from '../../../common/types/jwt-user.type';
import { normalizePagination } from '../../../common/utils/pagination.util';
import { RedisService } from '../../../core/redis/redis.service';
import { QueueService } from '../../../core/queue/queue.service';
import { WebsocketService } from '../../../core/websocket/websocket.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import type { JwtAccessPayload } from '../types/jwt-access-payload.type';
import type { JwtRefreshPayload } from '../types/jwt-refresh-payload.type';
import type { MailJobPayload } from '../types/mail-job-payload.type';
import { UserRepository } from '../repositories/user.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { DeviceMetadataService } from './device-metadata.service';
import { AuthAuditService } from './auth-audit.service';
import { AuthMailTemplateService } from './auth-mail-template.service';

interface TokenPairResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
    private readonly websocketService: WebsocketService,
    private readonly userRepository: UserRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly deviceMetadataService: DeviceMetadataService,
    private readonly authAuditService: AuthAuditService,
    private readonly authMailTemplateService: AuthMailTemplateService,
  ) {}

  async createLoginSession(
    user: User,
    request: AuthenticatedRequest,
  ): Promise<{ session: UserSession; tokens: TokenPairResult; roles: string[]; permissions: string[] }> {
    const roles = await this.userRepository.getRoleCodes(user.id);
    const permissions = await this.userRepository.getPermissionCodes(user.id);
    const deviceMetadata = this.deviceMetadataService.fromRequest(request);
    const refreshExpiresAt = this.resolveRefreshExpiryDate();

    const session = this.userSessionRepository.create({
      userId: user.id,
      tokenVersion: 1,
      issuedAt: new Date(),
      lastActiveAt: new Date(),
      lastRefreshedAt: new Date(),
      expiresAt: refreshExpiresAt,
      ...deviceMetadata,
    });

    const tokens = await this.generateTokenPair(user, session.id, session.tokenVersion, roles, permissions);
    session.refreshTokenHash = await this.hashSecret(tokens.refreshToken);

    await this.userSessionRepository.save(session);
    await this.authAuditService.log(user.id, 'AUTH', 'login', {
      sessionId: session.id,
      deviceName: deviceMetadata.deviceName,
      ipAddress: deviceMetadata.ipAddress,
    });
    this.websocketService.emitToUser(user.id, 'auth.session.created', {
      sessionId: session.id,
      deviceName: session.deviceName,
    });

    return { session, tokens, roles, permissions };
  }

  async refresh(
    refreshToken: string,
    request: AuthenticatedRequest,
  ): Promise<{ user: User; session: UserSession; tokens: TokenPairResult; roles: string[]; permissions: string[] }> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.userSessionRepository.findById(payload.sessionId);
    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt || (session.expiresAt && session.expiresAt <= new Date())) {
      throw new UnauthorizedException('Session is no longer active');
    }

    if (payload.tokenVersion !== session.tokenVersion) {
      await this.handleRefreshTokenReuse(session, payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const matches = await compare(refreshToken, session.refreshTokenHash);
    if (!matches) {
      await this.handleRefreshTokenReuse(session, payload.sub);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const roles = await this.userRepository.getRoleCodes(user.id);
    const permissions = await this.userRepository.getPermissionCodes(user.id);
    session.tokenVersion += 1;
    session.lastActiveAt = new Date();
    session.lastRefreshedAt = new Date();
    session.expiresAt = this.resolveRefreshExpiryDate();
    Object.assign(session, this.deviceMetadataService.fromRequest(request, session.deviceName ?? undefined));

    const tokens = await this.generateTokenPair(
      user,
      session.id,
      session.tokenVersion,
      roles,
      permissions,
    );
    session.refreshTokenHash = await this.hashSecret(tokens.refreshToken);

    await this.userSessionRepository.save(session);

    return { user, session, tokens, roles, permissions };
  }

  async authorizeRequestUser(user: JwtUser): Promise<JwtUser> {
    const session = await this.userSessionRepository.findActiveById(user.sessionId);
    if (!session || session.userId !== user.userId) {
      throw new UnauthorizedException('Session is no longer active');
    }

    if (session.expiresAt && session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    await this.touchSession(user.sessionId);
    return user;
  }

  async logoutCurrent(user: JwtUser): Promise<void> {
    await this.userSessionRepository.revokeSession(user.sessionId, 'logout_current');
    await this.authAuditService.log(user.userId, 'AUTH', 'logout', {
      sessionId: user.sessionId,
    });
    this.websocketService.emitToUser(user.userId, 'auth.session.revoked', {
      sessionId: user.sessionId,
    });
  }

  async logoutAll(user: JwtUser): Promise<void> {
    await this.userSessionRepository.revokeAllForUser(user.userId, 'logout_all');
    await this.authAuditService.log(user.userId, 'AUTH', 'logout_all', {
      sessionId: user.sessionId,
    });
    this.websocketService.emitToUser(user.userId, 'auth.sessions.revoked', {
      reason: 'logout_all',
    });
  }

  async revokeSpecificSession(user: JwtUser, sessionId: string): Promise<void> {
    const session = await this.userSessionRepository.findById(sessionId);
    if (!session || session.userId !== user.userId) {
      throw new NotFoundException('Session not found');
    }

    await this.userSessionRepository.revokeSession(sessionId, 'manual_revoke');
    await this.authAuditService.log(user.userId, 'AUTH', 'revoke_session', {
      sessionId,
    });
    this.websocketService.emitToUser(user.userId, 'auth.session.revoked', {
      sessionId,
    });
  }

  async listActiveSessions(user: JwtUser, page?: number, limit?: number) {
    const normalized = normalizePagination({ page, limit });
    const [items, total] = await Promise.all([
      this.userSessionRepository.findActiveSessionsByUserId(user.userId, {
        order: { lastActiveAt: 'DESC' },
        skip: (normalized.page - 1) * normalized.limit,
        take: normalized.limit,
      }),
      this.userSessionRepository.countActiveSessionsByUserId(user.userId),
    ]);

    return {
      items: items.map((item) => this.serializeSession(item, user.sessionId)),
      meta: {
        page: normalized.page,
        limit: normalized.limit,
        total,
      },
    };
  }

  async revokeOtherSessionsForPasswordChange(user: JwtUser): Promise<void> {
    await this.userSessionRepository.revokeAllForUser(
      user.userId,
      'password_changed',
      user.sessionId,
    );
  }

  async cleanup(): Promise<void> {
    await this.userSessionRepository.cleanupExpiredOrRevoked(new Date());
  }

  serializeSession(session: UserSession, currentSessionId?: string) {
    return {
      id: session.id,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      userAgent: session.userAgent,
      issuedAt: session.issuedAt.toISOString(),
      lastActiveAt: session.lastActiveAt.toISOString(),
      expiresAt: session.expiresAt ? session.expiresAt.toISOString() : null,
      isCurrent: session.id === currentSessionId,
    };
  }

  private async touchSession(sessionId: string): Promise<void> {
    const throttleSeconds = this.configService.get<number>('auth.sessionTouchThrottleSeconds', 60);
    const cacheKey = `auth:session-touch:${sessionId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return;
    }

    const session = await this.userSessionRepository.findActiveById(sessionId);
    if (session) {
      session.lastActiveAt = new Date();
      await this.userSessionRepository.save(session);
    }

    await this.redisService.set(cacheKey, '1', throttleSeconds);
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtRefreshPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async handleRefreshTokenReuse(session: UserSession, userId: string): Promise<void> {
    const compromisedAt = new Date();
    await this.userSessionRepository.revokeAllForUser(
      userId,
      'refresh_token_reuse_detected',
      undefined,
      compromisedAt,
    );

    const user = await this.userRepository.findById(userId);
    if (user) {
      const template = this.authMailTemplateService.buildSecurityAlertEmail(
        user.fullName ?? user.email,
        'We detected reuse of a refresh token and revoked all active sessions.',
      );
      await this.enqueueMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    }

    await this.authAuditService.log(userId, 'AUTH', 'refresh_reuse_detected', {
      sessionId: session.id,
      compromisedAt: compromisedAt.toISOString(),
    });
  }

  private async generateTokenPair(
    user: User,
    sessionId: string,
    tokenVersion: number,
    roles: string[],
    permissions: string[],
  ): Promise<TokenPairResult> {
    const accessPayload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      sessionId,
      roles,
      permissions,
      type: 'access',
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      sessionId,
      tokenVersion,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.getJwtExpiry('jwt.accessExpiresIn', '15m') as never,
        jwtid: randomUUID(),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.getJwtExpiry('jwt.refreshExpiresIn', '7d') as never,
        jwtid: randomUUID(),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private resolveRefreshExpiryDate(): Date {
    const now = Date.now();
    const raw = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
    const match = raw.match(/^(\d+)([mhd])$/);
    if (!match) {
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multiplier =
      unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;

    return new Date(now + value * multiplier);
  }

  private hashSecret(value: string): Promise<string> {
    const rounds = this.configService.get<number>('auth.bcryptRounds', 12);
    return hash(value, rounds);
  }

  private getJwtExpiry(key: string, fallback: string): number | string {
    return this.configService.get<string>(key, fallback);
  }

  private enqueueMail(payload: MailJobPayload): Promise<void> {
    return this.queueService.enqueueMail(payload as unknown as Record<string, unknown>);
  }
}
