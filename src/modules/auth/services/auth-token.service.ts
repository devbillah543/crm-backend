import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { User } from '../../../database/entities/user.entity';
import { AuthActionTokenPurpose } from '../../../database/entities/auth-action-token.entity';
import { AuthActionTokenRepository } from '../repositories/auth-action-token.repository';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authActionTokenRepository: AuthActionTokenRepository,
  ) {}

  async createToken(
    user: User,
    purpose: AuthActionTokenPurpose,
    email?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    await this.authActionTokenRepository.invalidateOutstanding(user.id, purpose);

    const rawToken = randomBytes(24).toString('hex');
    const token = this.authActionTokenRepository.create({
      userId: user.id,
      purpose,
      tokenHash: this.hash(rawToken),
      email: email ?? user.email,
      metadata: metadata ?? null,
      expiresAt: this.calculateExpiry(purpose),
      consumedAt: null,
      createdAt: new Date(),
    });

    await this.authActionTokenRepository.save(token);
    return rawToken;
  }

  async consumeToken(rawToken: string, purpose: AuthActionTokenPurpose) {
    const token = await this.authActionTokenRepository.findActiveByHash(this.hash(rawToken), purpose);
    if (!token || token.expiresAt <= new Date()) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    await this.authActionTokenRepository.consume(token.id);
    return token;
  }

  cleanup(): Promise<void> {
    return this.authActionTokenRepository.cleanupExpired(new Date());
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private calculateExpiry(purpose: AuthActionTokenPurpose): Date {
    const now = Date.now();
    if (purpose === 'password_reset') {
      return new Date(
        now +
          this.configService.get<number>('auth.resetPasswordExpiresMinutes', 30) * 60_000,
      );
    }

    return new Date(
      now +
        this.configService.get<number>('auth.verificationExpiresHours', 24) * 3_600_000,
    );
  }
}
