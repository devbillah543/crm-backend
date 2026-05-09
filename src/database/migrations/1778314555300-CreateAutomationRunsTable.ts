import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutomationRunsTable1778314555300 implements MigrationInterface {
  name = 'CreateAutomationRunsTable1778314555300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "automation_runs" ("id" uuid NOT NULL, "automation_name" character varying(128) NOT NULL, "trigger_type" character varying(32), "trigger_source" character varying(255), "target_table" character varying(64), "status" character varying(16) NOT NULL DEFAULT 'running', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "finished_at" TIMESTAMP WITH TIME ZONE, "duration_ms" integer, "records_processed_count" integer NOT NULL DEFAULT '0', "records_succeeded_count" integer NOT NULL DEFAULT '0', "records_failed_count" integer NOT NULL DEFAULT '0', "processed_record_ids" jsonb, "failed_records" jsonb, "success_log" text, "error_log" text, "input_payload" jsonb, "triggered_by_user_id" uuid, CONSTRAINT "PK_273137fa78ff9340128ab98445f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "automation_runs"`);
  }
}
