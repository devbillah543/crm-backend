import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('call_logs')
export class CallLog extends UuidPrimaryEntity {
  @Column({ name: 'lead_id', type: 'uuid' })
  leadId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'called_at', type: 'timestamptz' })
  calledAt!: Date;

  @Column({ name: 'result_code', type: 'varchar', length: 32, nullable: true })
  resultCode!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  source!: string | null;

  @Column({ name: 'mighty_call_id', type: 'varchar', length: 128, nullable: true })
  mightyCallId!: string | null;

  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload!: Record<string, unknown> | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
