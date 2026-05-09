import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import {
  AuthActionToken,
  AuthActionTokenPurpose,
} from '../../../database/entities/auth-action-token.entity';

@Injectable()
export class AuthActionTokenRepository {
  constructor(
    @InjectRepository(AuthActionToken)
    private readonly repository: Repository<AuthActionToken>,
  ) {}

  create(values: Partial<AuthActionToken>): AuthActionToken {
    return this.repository.create(values);
  }

  save(token: AuthActionToken): Promise<AuthActionToken> {
    return this.repository.save(token);
  }

  findActiveByHash(
    tokenHash: string,
    purpose: AuthActionTokenPurpose,
  ): Promise<AuthActionToken | null> {
    return this.repository.findOne({
      where: {
        tokenHash,
        purpose,
        consumedAt: IsNull(),
      },
    });
  }

  async consume(id: string): Promise<void> {
    await this.repository.update({ id }, { consumedAt: new Date() });
  }

  async invalidateOutstanding(userId: string, purpose: AuthActionTokenPurpose): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(AuthActionToken)
      .set({ consumedAt: new Date() })
      .where('"user_id" = :userId', { userId })
      .andWhere('"purpose" = :purpose', { purpose })
      .andWhere('"consumed_at" IS NULL')
      .execute();
  }

  async cleanupExpired(now: Date): Promise<void> {
    await this.repository.delete([{ expiresAt: LessThan(now) }, { consumedAt: LessThan(now) }]);
  }
}
