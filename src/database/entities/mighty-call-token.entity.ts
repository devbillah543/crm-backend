import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('mighty_call_tokens')
export class MightyCallToken extends UuidPrimaryEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'api_key', type: 'text', nullable: true })
  apiKey!: string | null;

  @Column({ name: 'client_secret', type: 'text', nullable: true })
  clientSecret!: string | null;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken!: string | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken!: string | null;

  @Column({ name: 'user_number', type: 'varchar', length: 32, nullable: true })
  userNumber!: string | null;

  @Column({ name: 'auto_dial', default: false })
  autoDial!: boolean;

  @Column({ name: 'fetched_at', type: 'timestamptz', nullable: true })
  fetchedAt!: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;
}
