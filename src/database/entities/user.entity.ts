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

  @Column({ name: 'mfa_secret', type: 'text', nullable: true })
  mfaSecret!: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'failed_login_count', type: 'int', default: 0 })
  failedLoginCount!: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil!: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
