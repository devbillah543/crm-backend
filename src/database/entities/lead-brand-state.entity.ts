import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('lead_brand_state')
export class LeadBrandState extends UuidPrimaryEntity {
  @Column({ name: 'lead_id', type: 'uuid' })
  leadId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'lead_type', type: 'varchar', length: 32, nullable: true })
  leadType!: string | null;

  @Column({ name: 'previous_lead_type', type: 'varchar', length: 32, nullable: true })
  previousLeadType!: string | null;

  @Column({ name: 'to_be_called_by_user_id', type: 'uuid', nullable: true })
  toBeCalledByUserId!: string | null;

  @Column({ name: 'last_called_by_user_id', type: 'uuid', nullable: true })
  lastCalledByUserId!: string | null;

  @Column({ name: 'last_called_by_dashboard_user_id', type: 'uuid', nullable: true })
  lastCalledByDashboardUserId!: string | null;

  @Column({ name: 'last_called_date', type: 'date', nullable: true })
  lastCalledDate!: string | null;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate!: string | null;

  @Column({ name: 'next_follow_up_date', type: 'date', nullable: true })
  nextFollowUpDate!: string | null;

  @Column({ name: 'date_became_hot', type: 'date', nullable: true })
  dateBecameHot!: string | null;

  @Column({ name: 'days_hot', type: 'int', nullable: true })
  daysHot!: number | null;

  @Column({ name: 'date_became_ignore', type: 'date', nullable: true })
  dateBecameIgnore!: string | null;

  @Column({ name: 'days_ignore', type: 'int', nullable: true })
  daysIgnore!: number | null;

  @Column({ name: 'cant_locate_date', type: 'date', nullable: true })
  cantLocateDate!: string | null;

  @Column({ name: 'call_result_code', type: 'varchar', length: 32, nullable: true })
  callResultCode!: string | null;

  @Column({ name: 'is_to_be_logged', default: false })
  isToBeLogged!: boolean;

  @Column({ name: 'is_to_be_sent_email', default: false })
  isToBeSentEmail!: boolean;

  @Column({ name: 'auto_dial_mighty_call', default: false })
  autoDialMightyCall!: boolean;

  @Column({ name: 'last_modified_time_lead_type', type: 'timestamptz', nullable: true })
  lastModifiedTimeLeadType!: Date | null;

  @Column({ name: 'last_updated_to_be_called_at', type: 'timestamptz', nullable: true })
  lastUpdatedToBeCalledAt!: Date | null;

  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
