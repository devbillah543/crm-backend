import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSmsLogsTable1778314555420 implements MigrationInterface {
  name = 'CreateSmsLogsTable1778314555420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sms_logs" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "user_id" uuid, "sent_at" TIMESTAMP WITH TIME ZONE, "direction" character varying(8), "status" character varying(32), "body" text, "raw_payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_811e3a63f5e14a50475c6e8be3d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sms_logs"`);
  }
}
