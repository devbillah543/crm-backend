import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandRulesTable1778314555460 implements MigrationInterface {
  name = 'CreateBrandRulesTable1778314555460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brand_rules" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "brand_id" uuid NOT NULL, "rule_type" character varying(64) NOT NULL, "rule_key" character varying(128) NOT NULL, "rule_value" jsonb NOT NULL, "description" text, CONSTRAINT "PK_ec96110b754b7d374fe77b4a44f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fb59b2449255e126757d54fa1" ON "brand_rules" ("created_at") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_brand_rule_deleted_at" ON "brand_rules" ("deleted_at") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_brand_rule_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2fb59b2449255e126757d54fa1"`);
    await queryRunner.query(`DROP TABLE "brand_rules"`);
  }
}
