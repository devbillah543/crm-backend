import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdditionalContactsTable1778314555280 implements MigrationInterface {
  name = 'CreateAdditionalContactsTable1778314555280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "additional_contacts" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "company_id" uuid NOT NULL, "first_name" character varying(128), "last_name" character varying(128), "name" character varying(255), "role" character varying(128), "email" character varying(255), CONSTRAINT "PK_3c2fcb85ca4e5e25c89ce88511a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_282b2c3fcc51740054b399e561" ON "additional_contacts" ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_282b2c3fcc51740054b399e561"`);
    await queryRunner.query(`DROP TABLE "additional_contacts"`);
  }
}
