import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('user_daily_scores')
export class UserDailyScore extends UuidPrimaryEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'score_date', type: 'date' })
  scoreDate!: string;

  @Column({ name: 'calls_made', type: 'int', default: 0 })
  callsMade!: number;

  @Column({ name: 'hot_leads', type: 'int', default: 0 })
  hotLeads!: number;

  @Column({ name: 'lost_hot_leads', type: 'int', default: 0 })
  lostHotLeads!: number;

  @Column({ name: 'contracts_closed', type: 'int', default: 0 })
  contractsClosed!: number;

  @Column({ type: 'int', default: 0 })
  points!: number;

  @Column({ name: 'snapshot_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  snapshotAt!: Date;
}
