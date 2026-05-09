import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('sms_logs')
export class SmsLog extends UuidPrimaryEntity {
  @Column({ name: 'lead_id', type: 'uuid' })
  leadId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  direction!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  status!: string | null;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload!: Record<string, unknown> | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
