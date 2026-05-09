import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRoleAssignmentsTable1778314555340 implements MigrationInterface {
  name = 'CreateUserRoleAssignmentsTable1778314555340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_role_assignments" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "brand_id" uuid, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "assigned_by_user_id" uuid, CONSTRAINT "PK_ac634a3aa59d70bf0fb7b423b47" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_role_assignments"`);
  }
}
