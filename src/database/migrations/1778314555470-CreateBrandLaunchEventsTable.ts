import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandLaunchEventsTable1778314555470 implements MigrationInterface {
  name = 'CreateBrandLaunchEventsTable1778314555470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brand_launch_events" ("id" uuid NOT NULL, "brand_id" uuid NOT NULL, "triggered_by_user_id" uuid, "filter_criteria" jsonb, "distribution_strategy" jsonb, "state_mapping_rules" jsonb, "leads_assigned_count" integer, "is_dry_run" boolean NOT NULL DEFAULT false, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "finished_at" TIMESTAMP WITH TIME ZONE, "status" character varying(16), "notes" text, CONSTRAINT "PK_4d3b96bf9c7b8ac52c0d640b64a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "brand_launch_events"`);
  }
}
