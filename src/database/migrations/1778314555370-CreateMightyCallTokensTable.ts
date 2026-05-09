import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMightyCallTokensTable1778314555370 implements MigrationInterface {
  name = 'CreateMightyCallTokensTable1778314555370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "mighty_call_tokens" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "api_key" text, "client_secret" text, "access_token" text, "refresh_token" text, "user_number" character varying(32), "auto_dial" boolean NOT NULL DEFAULT false, "fetched_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_bbe1f5a122173ed8400598d2d1d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "mighty_call_tokens"`);
  }
}
