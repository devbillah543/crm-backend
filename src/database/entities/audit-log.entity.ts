import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: string;

  @Column({ name: 'table_name', type: 'varchar', length: 64 })
  tableName!: string;

  @Column({ name: 'record_id', type: 'uuid' })
  recordId!: string;

  @Column({ name: 'field_name', type: 'varchar', length: 128, nullable: true })
  fieldName!: string | null;

  @Column({ type: 'varchar', length: 8 })
  operation!: string;

  @Column({ name: 'actor_type', type: 'varchar', length: 16 })
  actorType!: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue!: Record<string, unknown> | string | number | boolean | null | unknown[];

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue!: Record<string, unknown> | string | number | boolean | null | unknown[];

  @Column({ name: 'change_group_id', type: 'uuid' })
  changeGroupId!: string;

  @Column({ name: 'changed_by_user_id', type: 'uuid', nullable: true })
  changedByUserId!: string | null;

  @Column({ name: 'changed_by_automation_run_id', type: 'uuid', nullable: true })
  changedByAutomationRunId!: string | null;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  changedAt!: Date;
}
