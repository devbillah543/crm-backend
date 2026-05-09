import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1778314555230 implements MigrationInterface {
  name = 'CreateRolesTable1778314555230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL, "code" character varying(32) NOT NULL, "display_name" character varying(128), "description" text, "is_system" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE ("code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
