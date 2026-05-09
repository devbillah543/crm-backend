import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionsTable1778314555220 implements MigrationInterface {
  name = 'CreatePermissionsTable1778314555220';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL, "code" character varying(64) NOT NULL, "display_name" character varying(128), "description" text, "category" character varying(32), CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
