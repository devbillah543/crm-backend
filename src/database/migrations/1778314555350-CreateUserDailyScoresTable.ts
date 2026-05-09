import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserDailyScoresTable1778314555350 implements MigrationInterface {
  name = 'CreateUserDailyScoresTable1778314555350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_daily_scores" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "score_date" date NOT NULL, "calls_made" integer NOT NULL DEFAULT '0', "hot_leads" integer NOT NULL DEFAULT '0', "lost_hot_leads" integer NOT NULL DEFAULT '0', "contracts_closed" integer NOT NULL DEFAULT '0', "points" integer NOT NULL DEFAULT '0', "snapshot_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d2a368bf5304d0ecbf95a807e16" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_daily_scores"`);
  }
}
