import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompaniesTable1778314555260 implements MigrationInterface {
  name = 'CreateCompaniesTable1778314555260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "company_symbol" character varying(16) NOT NULL, "company_name" character varying(255) NOT NULL, "company_type" character varying(32), "previous_company_symbol" character varying(16), "previous_company_name" character varying(255), "cusip" character varying(16), "cik" character varying(16), "country" character varying(64), "city" character varying(128), "state" character varying(64), "zip" character varying(32), "timezone" character varying(64), "website" character varying(512), "icon" character varying(512), "twitter" character varying(128), "description" text, "estimated_marketcap" numeric(20,2), "created_by_user_id" uuid, CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b559ae26b6f801536d28109453" ON "companies" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_deleted_at" ON "companies" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_company_symbol_active_unique" ON "companies" ("company_symbol") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_company_symbol_active_unique"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b559ae26b6f801536d28109453"`);
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
