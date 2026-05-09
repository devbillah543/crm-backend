import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogTable1778314555310 implements MigrationInterface {
  name = 'CreateAuditLogTable1778314555310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" BIGSERIAL NOT NULL, "table_name" character varying(64) NOT NULL, "record_id" uuid NOT NULL, "field_name" character varying(128), "operation" character varying(8) NOT NULL, "actor_type" character varying(16) NOT NULL, "old_value" jsonb, "new_value" jsonb, "change_group_id" uuid NOT NULL, "changed_by_user_id" uuid, "changed_by_automation_run_id" uuid, "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}
