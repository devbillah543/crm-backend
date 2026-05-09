import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('user_sessions')
export class UserSession extends UuidPrimaryEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'refresh_token_hash', type: 'text', unique: true })
  refreshTokenHash!: string;

  @Column({ name: 'token_version', type: 'int', default: 1 })
  tokenVersion!: number;

  @Column({ name: 'issued_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt!: Date;

  @Column({ name: 'last_active_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActiveAt!: Date;

  @Column({ name: 'last_refreshed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastRefreshedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({ name: 'revoked_reason', type: 'varchar', length: 128, nullable: true })
  revokedReason!: string | null;

  @Column({ name: 'compromised_at', type: 'timestamptz', nullable: true })
  compromisedAt!: Date | null;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  browser!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  os!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;
}
