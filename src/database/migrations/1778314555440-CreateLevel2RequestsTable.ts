import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLevel2RequestsTable1778314555440 implements MigrationInterface {
  name = 'CreateLevel2RequestsTable1778314555440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "level_2_requests" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "submitted_by_user_id" uuid, "assigned_to_user_id" uuid, "campaign_type" character varying(32), "result_update" character varying(64), "updated_notes" text, "call_back_date" date, "date_of_follow_up" date, "date_of_next_followup" date, "new_lead_type" character varying(32), "previous_lead_type" character varying(32), "previous_history_call_notes" text, "status" character varying(16) NOT NULL DEFAULT 'pending', "processed_at" TIMESTAMP WITH TIME ZONE, "processed_by_run_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cc8f19162b0f773e99e2a8aa39c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "level_2_requests"`);
  }
}
