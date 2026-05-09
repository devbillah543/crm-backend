import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, LessThan, Repository } from 'typeorm';
import { UserSession } from '../../../database/entities/user-session.entity';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSession) private readonly repository: Repository<UserSession>,
  ) {}

  create(values: Partial<UserSession>): UserSession {
    return this.repository.create(values);
  }

  save(session: UserSession): Promise<UserSession> {
    return this.repository.save(session);
  }

  findById(id: string): Promise<UserSession | null> {
    return this.repository.findOne({ where: { id } });
  }

  findActiveById(id: string): Promise<UserSession | null> {
    return this.repository.findOne({ where: { id, revokedAt: IsNull() } });
  }

  async revokeSession(id: string, revokedReason: string): Promise<void> {
    await this.repository.update(
      { id, revokedAt: IsNull() },
      { revokedAt: new Date(), revokedReason },
    );
  }

  async revokeAllForUser(
    userId: string,
    revokedReason: string,
    exceptSessionId?: string,
    compromisedAt?: Date,
  ): Promise<void> {
    const query = this.repository
      .createQueryBuilder()
      .update(UserSession)
      .set({
        revokedAt: new Date(),
        revokedReason,
        compromisedAt: compromisedAt ?? null,
      })
      .where('"user_id" = :userId', { userId })
      .andWhere('"revoked_at" IS NULL');

    if (exceptSessionId) {
      query.andWhere('"id" != :exceptSessionId', { exceptSessionId });
    }

    await query.execute();
  }

  findActiveSessionsByUserId(
    userId: string,
    options: FindManyOptions<UserSession>,
  ): Promise<UserSession[]> {
    return this.repository.find({
      ...options,
      where: {
        userId,
        revokedAt: IsNull(),
      },
    });
  }

  countActiveSessionsByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        revokedAt: IsNull(),
      },
    });
  }

  async cleanupExpiredOrRevoked(now: Date): Promise<void> {
    await this.repository.delete([
      { revokedAt: LessThan(now) },
      { expiresAt: LessThan(now) },
    ]);
  }
}
