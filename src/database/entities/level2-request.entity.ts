import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('level_2_requests')
export class Level2Request extends UuidPrimaryEntity {
  @Column({ name: 'lead_id', type: 'uuid' })
  leadId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'submitted_by_user_id', type: 'uuid', nullable: true })
  submittedByUserId!: string | null;

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId!: string | null;

  @Column({ name: 'campaign_type', type: 'varchar', length: 32, nullable: true })
  campaignType!: string | null;

  @Column({ name: 'result_update', type: 'varchar', length: 64, nullable: true })
  resultUpdate!: string | null;

  @Column({ name: 'updated_notes', type: 'text', nullable: true })
  updatedNotes!: string | null;

  @Column({ name: 'call_back_date', type: 'date', nullable: true })
  callBackDate!: string | null;

  @Column({ name: 'date_of_follow_up', type: 'date', nullable: true })
  dateOfFollowUp!: string | null;

  @Column({ name: 'date_of_next_followup', type: 'date', nullable: true })
  dateOfNextFollowup!: string | null;

  @Column({ name: 'new_lead_type', type: 'varchar', length: 32, nullable: true })
  newLeadType!: string | null;

  @Column({ name: 'previous_lead_type', type: 'varchar', length: 32, nullable: true })
  previousLeadType!: string | null;

  @Column({ name: 'previous_history_call_notes', type: 'text', nullable: true })
  previousHistoryCallNotes!: string | null;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: string;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @Column({ name: 'processed_by_run_id', type: 'uuid', nullable: true })
  processedByRunId!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
