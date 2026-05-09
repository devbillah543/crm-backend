import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('brand_launch_events')
export class BrandLaunchEvent extends UuidPrimaryEntity {
  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'triggered_by_user_id', type: 'uuid', nullable: true })
  triggeredByUserId!: string | null;

  @Column({ name: 'filter_criteria', type: 'jsonb', nullable: true })
  filterCriteria!: Record<string, unknown> | null;

  @Column({ name: 'distribution_strategy', type: 'jsonb', nullable: true })
  distributionStrategy!: Record<string, unknown> | null;

  @Column({ name: 'state_mapping_rules', type: 'jsonb', nullable: true })
  stateMappingRules!: Record<string, unknown> | null;

  @Column({ name: 'leads_assigned_count', type: 'int', nullable: true })
  leadsAssignedCount!: number | null;

  @Column({ name: 'is_dry_run', default: false })
  isDryRun!: boolean;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ name: 'status', type: 'varchar', length: 16, nullable: true })
  status!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
