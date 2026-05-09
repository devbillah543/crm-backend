import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCallLogsTable1778314555430 implements MigrationInterface {
  name = 'CreateCallLogsTable1778314555430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "call_logs" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "user_id" uuid NOT NULL, "called_at" TIMESTAMP WITH TIME ZONE NOT NULL, "result_code" character varying(32), "notes" text, "source" character varying(16), "mighty_call_id" character varying(128), "raw_payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aa08476bcc13bfdf394261761e9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "call_logs"`);
  }
}
