import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCrossBrandRulesTable1778314555450 implements MigrationInterface {
  name = 'CreateCrossBrandRulesTable1778314555450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cross_brand_rules" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(128) NOT NULL, "trigger_event" character varying(64) NOT NULL, "condition" jsonb NOT NULL, "action" jsonb NOT NULL, "priority" integer NOT NULL DEFAULT '100', "is_active" boolean NOT NULL DEFAULT true, "description" text, CONSTRAINT "PK_e6a4ade8408248dc4721bc9f130" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e63795f2e0671a40257c169c83" ON "cross_brand_rules" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cross_brand_rule_deleted_at" ON "cross_brand_rules" ("deleted_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_cross_brand_rule_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e63795f2e0671a40257c169c83"`);
    await queryRunner.query(`DROP TABLE "cross_brand_rules"`);
  }
}
