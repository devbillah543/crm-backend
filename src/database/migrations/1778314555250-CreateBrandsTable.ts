import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandsTable1778314555250 implements MigrationInterface {
  name = 'CreateBrandsTable1778314555250';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, "parent_brand_id" uuid, "code" character varying(32) NOT NULL, "display_name" character varying(128) NOT NULL, "icon" character varying(512), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f247307b5b1a85dd981ec8ffc" ON "brands" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brand_deleted_at" ON "brands" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_brand_code_active_unique" ON "brands" ("code") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "FK_ed6cc1dbd7561850ba4818c5b4d" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "FK_ed6cc1dbd7561850ba4818c5b4d"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_brand_code_active_unique"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_brand_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1f247307b5b1a85dd981ec8ffc"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
