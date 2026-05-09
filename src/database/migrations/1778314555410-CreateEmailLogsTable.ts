import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailLogsTable1778314555410 implements MigrationInterface {
  name = 'CreateEmailLogsTable1778314555410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_logs" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "user_id" uuid, "sent_at" TIMESTAMP WITH TIME ZONE, "status" character varying(32), "subject" character varying(512), "body" text, "provider_message_id" character varying(255), "raw_payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_999382218924e953a790d340571" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_logs"`);
  }
}
