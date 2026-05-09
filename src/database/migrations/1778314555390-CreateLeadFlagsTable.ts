import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeadFlagsTable1778314555390 implements MigrationInterface {
  name = 'CreateLeadFlagsTable1778314555390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "lead_flags" ("id" uuid NOT NULL, "lead_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "flag_type" character varying(32) NOT NULL, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "resolved_at" TIMESTAMP WITH TIME ZONE, "resolved_by_user_id" uuid, CONSTRAINT "PK_6fdc1b208c0fc16e4ed36748989" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "lead_flags"`);
  }
}
