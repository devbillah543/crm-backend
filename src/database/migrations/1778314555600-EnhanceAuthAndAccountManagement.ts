import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceAuthAndAccountManagement1778314555600 implements MigrationInterface {
  name = 'EnhanceAuthAndAccountManagement1778314555600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_failed_login_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password_changed_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "verification_email_sent_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar_key" character varying(512)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "mfa_secret"`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "token_version" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "last_refreshed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "revoked_reason" character varying(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "compromised_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "device_name" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "browser" character varying(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "os" character varying(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "ip_address" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "location" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD "user_agent" text`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_sessions_user_id" ON "user_sessions" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_sessions_last_active_at" ON "user_sessions" ("last_active_at") `,
    );

    await queryRunner.query(
      `CREATE TABLE "auth_action_tokens" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "purpose" character varying(32) NOT NULL, "token_hash" character varying(128) NOT NULL, "email" character varying(255), "metadata" jsonb, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "consumed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_auth_action_tokens_token_hash" UNIQUE ("token_hash"), CONSTRAINT "PK_auth_action_tokens_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_action_tokens_user_id" ON "auth_action_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_action_tokens_purpose" ON "auth_action_tokens" ("purpose") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_action_tokens_expires_at" ON "auth_action_tokens" ("expires_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_auth_action_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_auth_action_tokens_purpose"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_auth_action_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE "auth_action_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_sessions_last_active_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_sessions_user_id"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "user_agent"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "ip_address"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "os"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "browser"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "device_name"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "compromised_at"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "revoked_reason"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "last_refreshed_at"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "last_active_at"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "token_version"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "mfa_secret" text`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_key"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verification_email_sent_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_changed_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_failed_login_at"`);
  }
}
