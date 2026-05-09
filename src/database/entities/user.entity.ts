import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base.entity';

@Entity('users')
export class User extends TimestampedEntity {
  @Column({ type: 'varchar', unique: true, length: 255 })
  email!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 128, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 128, nullable: true })
  lastName!: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName!: string | null;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'failed_login_count', type: 'int', default: 0 })
  failedLoginCount!: number;

  @Column({ name: 'last_failed_login_at', type: 'timestamptz', nullable: true })
  lastFailedLoginAt!: Date | null;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil!: Date | null;

  @Column({ name: 'password_changed_at', type: 'timestamptz', nullable: true })
  passwordChangedAt!: Date | null;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: 'verification_email_sent_at', type: 'timestamptz', nullable: true })
  verificationEmailSentAt!: Date | null;

  @Column({ name: 'avatar_key', type: 'varchar', length: 512, nullable: true })
  avatarKey!: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
