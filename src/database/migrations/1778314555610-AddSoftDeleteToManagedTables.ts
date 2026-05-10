import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToManagedTables1778314555610 implements MigrationInterface {
  name = 'AddSoftDeleteToManagedTables1778314555610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_deleted_at" ON "users" ("deleted_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_organization_deleted_at" ON "organizations" ("deleted_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" ON "brands" ("deleted_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_company_deleted_at" ON "companies" ("deleted_at")`);

    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT IF EXISTS "UQ_7e27c3b62c681fbe3e2322535f2"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT IF EXISTS "UQ_1687d82f42d8b3f8162a29e7df4"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "UQ_230052816a81fb592f582f8730b"`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_email_active_unique" ON "users" ("email") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_organization_code_active_unique" ON "organizations" ("code") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_brand_code_active_unique" ON "brands" ("code") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_company_symbol_active_unique" ON "companies" ("company_symbol") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_company_symbol_active_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_brand_code_active_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_organization_code_active_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_user_email_active_unique"`);

    await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "UQ_230052816a81fb592f582f8730b" UNIQUE ("company_symbol")`);
    await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "UQ_1687d82f42d8b3f8162a29e7df4" UNIQUE ("code")`);
    await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "UQ_7e27c3b62c681fbe3e2322535f2" UNIQUE ("code")`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);

    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_company_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_brand_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_organization_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_user_deleted_at"`);

    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}
