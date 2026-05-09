import { Column, Entity } from 'typeorm';
import { UuidPrimaryEntity } from './base.entity';

@Entity('automation_runs')
export class AutomationRun extends UuidPrimaryEntity {
  @Column({ name: 'automation_name', type: 'varchar', length: 128 })
  automationName!: string;

  @Column({ name: 'trigger_type', type: 'varchar', length: 32, nullable: true })
  triggerType!: string | null;

  @Column({ name: 'trigger_source', type: 'varchar', length: 255, nullable: true })
  triggerSource!: string | null;

  @Column({ name: 'target_table', type: 'varchar', length: 64, nullable: true })
  targetTable!: string | null;

  @Column({ type: 'varchar', length: 16, default: 'running' })
  status!: string;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs!: number | null;

  @Column({ name: 'records_processed_count', type: 'int', default: 0 })
  recordsProcessedCount!: number;

  @Column({ name: 'records_succeeded_count', type: 'int', default: 0 })
  recordsSucceededCount!: number;

  @Column({ name: 'records_failed_count', type: 'int', default: 0 })
  recordsFailedCount!: number;

  @Column({ name: 'processed_record_ids', type: 'jsonb', nullable: true })
  processedRecordIds!: unknown[] | null;

  @Column({ name: 'failed_records', type: 'jsonb', nullable: true })
  failedRecords!: unknown[] | null;

  @Column({ name: 'success_log', type: 'text', nullable: true })
  successLog!: string | null;

  @Column({ name: 'error_log', type: 'text', nullable: true })
  errorLog!: string | null;

  @Column({ name: 'input_payload', type: 'jsonb', nullable: true })
  inputPayload!: Record<string, unknown> | null;

  @Column({ name: 'triggered_by_user_id', type: 'uuid', nullable: true })
  triggeredByUserId!: string | null;
}
