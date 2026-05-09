import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeadBrandStateTable1778314555380 implements MigrationInterface {
  name = 'CreateLeadBrandStateTable1778314555380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "lead_brand_state" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "lead_type" character varying(32), "previous_lead_type" character varying(32), "to_be_called_by_user_id" uuid, "last_called_by_user_id" uuid, "last_called_by_dashboard_user_id" uuid, "last_called_date" date, "follow_up_date" date, "next_follow_up_date" date, "date_became_hot" date, "days_hot" integer, "date_became_ignore" date, "days_ignore" integer, "cant_locate_date" date, "call_result_code" character varying(32), "is_to_be_logged" boolean NOT NULL DEFAULT false, "is_to_be_sent_email" boolean NOT NULL DEFAULT false, "auto_dial_mighty_call" boolean NOT NULL DEFAULT false, "last_modified_time_lead_type" TIMESTAMP WITH TIME ZONE, "last_updated_to_be_called_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_293906e5bf700679ef127a91c56" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "lead_brand_state"`);
  }
}
