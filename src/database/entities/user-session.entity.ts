import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('user_sessions')
export class UserSession extends UuidPrimaryEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'refresh_token_hash', type: 'text', unique: true })
  refreshTokenHash!: string;

  @Column({ name: 'issued_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
