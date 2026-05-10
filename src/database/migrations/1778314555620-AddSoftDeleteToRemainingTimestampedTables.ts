import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToRemainingTimestampedTables1778314555620 implements MigrationInterface {
  name = 'AddSoftDeleteToRemainingTimestampedTables1778314555620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "additional_contacts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cross_brand_rules" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand_rules" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_additional_contact_deleted_at" ON "additional_contacts" ("deleted_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_lead_deleted_at" ON "leads" ("deleted_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cross_brand_rule_deleted_at" ON "cross_brand_rules" ("deleted_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_brand_rule_deleted_at" ON "brand_rules" ("deleted_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_brand_rule_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_cross_brand_rule_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lead_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_additional_contact_deleted_at"`);

    await queryRunner.query(`ALTER TABLE "brand_rules" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "cross_brand_rules" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "additional_contacts" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}
