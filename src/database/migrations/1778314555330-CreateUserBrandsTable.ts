import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserBrandsTable1778314555330 implements MigrationInterface {
  name = 'CreateUserBrandsTable1778314555330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_brands" ("user_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a33896c38f849822809116f12f2" PRIMARY KEY ("user_id", "brand_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_brands"`);
  }
}
