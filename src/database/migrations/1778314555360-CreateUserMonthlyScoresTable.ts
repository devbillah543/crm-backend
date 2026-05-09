import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserMonthlyScoresTable1778314555360 implements MigrationInterface {
  name = 'CreateUserMonthlyScoresTable1778314555360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_monthly_scores" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "year_month" date NOT NULL, "calls_made" integer NOT NULL DEFAULT '0', "hot_leads" integer NOT NULL DEFAULT '0', "lost_hot_leads" integer NOT NULL DEFAULT '0', "contracts_closed" integer NOT NULL DEFAULT '0', "points" integer NOT NULL DEFAULT '0', "is_winner" boolean NOT NULL DEFAULT false, "snapshot_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ee694a05882829766b8e6f149c4" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_monthly_scores"`);
  }
}
