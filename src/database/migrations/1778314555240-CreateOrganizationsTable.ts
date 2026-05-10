import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationsTable1778314555240 implements MigrationInterface {
  name = 'CreateOrganizationsTable1778314555240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(32) NOT NULL, "display_name" character varying(128) NOT NULL, "description" text, "icon" character varying(512), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_7e27c3b62c681fbe3e2322535f2" UNIQUE ("code"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_016dacd1399bee33b39ad7fa97" ON "organizations" ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_016dacd1399bee33b39ad7fa97"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
  }
}
