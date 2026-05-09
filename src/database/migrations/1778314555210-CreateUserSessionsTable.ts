import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSessionsTable1778314555210 implements MigrationInterface {
  name = 'CreateUserSessionsTable1778314555210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "refresh_token_hash" text NOT NULL, "issued_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_cc132fa5f7a96610010e293e526" UNIQUE ("refresh_token_hash"), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_sessions"`);
  }
}
