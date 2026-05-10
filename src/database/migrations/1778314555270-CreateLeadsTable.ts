import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeadsTable1778314555270 implements MigrationInterface {
  name = 'CreateLeadsTable1778314555270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "leads" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "lead_id_external" character varying(64), "company_id" uuid, "full_name" character varying(255), "phone" character varying(32), "phone_extension" character varying(16), "email" character varying(255), "role" character varying(128), "timezone" character varying(64), "contact_type" character varying(32), "not_work_anymore" boolean NOT NULL DEFAULT false, "old_phones" jsonb NOT NULL DEFAULT '[]', "created_by_user_id" uuid, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0aa12c215b12c0e60fc3e82619" ON "leads" ("created_at") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_lead_deleted_at" ON "leads" ("deleted_at") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_lead_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0aa12c215b12c0e60fc3e82619"`);
    await queryRunner.query(`DROP TABLE "leads"`);
  }
}
