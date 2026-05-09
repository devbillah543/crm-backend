import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHotLeadEventsTable1778314555400 implements MigrationInterface {
  name = 'CreateHotLeadEventsTable1778314555400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "hot_lead_events" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "user_id" uuid, "event_type" character varying(32) NOT NULL, "event_at" TIMESTAMP WITH TIME ZONE NOT NULL, "notes" text, CONSTRAINT "PK_476e5520955aa325ccbbeb61e32" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "hot_lead_events"`);
  }
}
