import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import type { DataSource } from 'typeorm';
import dataSource from '../../core/database/database.datasource';
import { ensureDatabaseExists } from '../../core/database/ensure-database';
import { seedAdminUser } from './admin-user.seeder';
import { seedAgentUser } from './agent-user.seeder';
import { seedManagerUser } from './manager-user.seeder';
import { seedPermissions } from './permission.seeder';
import { seedSuperAdminUser } from './super-admin-user.seeder';
import type { SeederDefinition } from './types/seeder.type';

loadEnv();

class DatabaseSeeder {
  private getSeederArray(): SeederDefinition[] {
    const seederArray: SeederDefinition[] = [
      { name: 'permission', run: seedPermissions },
      { name: 'super-admin-user', run: seedSuperAdminUser },
      { name: 'admin-user', run: seedAdminUser },
      { name: 'manager-user', run: seedManagerUser },
      { name: 'agent-user', run: seedAgentUser },
    ];

    return seederArray;
  }

  async run(): Promise<void> {
    const targetSeederName = this.getTargetSeederName();
    console.log(
      targetSeederName
        ? `[db:seed] running seeder "${targetSeederName}"`
        : '[db:seed] running all seeders',
    );

    try {
      await ensureDatabaseExists();
      await dataSource.initialize();

      const seeders = this.getSeederArray();
      const selectedSeeders = targetSeederName
        ? this.filterSeedersByName(seeders, targetSeederName)
        : seeders;

      await this.runSeedersSequentially(dataSource, selectedSeeders);
      console.log('[db:seed] success');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[db:seed] error: ${message}`);
      process.exitCode = 1;
    } finally {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }

  private async runSeedersSequentially(
    appDataSource: DataSource,
    seeders: SeederDefinition[],
  ): Promise<void> {
    for (let index = 0; index < seeders.length; index += 1) {
      const seeder = seeders[index];
      console.log(`[db:seed] -> [${index}] ${seeder.name}`);
      const result = await seeder.run(appDataSource);

      if (result.skipped) {
        console.log(
          `[db:seed] <- ${seeder.name} skipped${result.reason ? `: ${result.reason}` : ''}`,
        );
        continue;
      }

      console.log(
        `[db:seed] <- ${seeder.name} done (created=${result.created}, updated=${result.updated})`,
      );
    }
  }

  private filterSeedersByName(
    seeders: SeederDefinition[],
    targetSeederName: string,
  ): SeederDefinition[] {
    const seeder = seeders.find((item) => item.name === targetSeederName);
    if (!seeder) {
      const availableSeeders = seeders.map((item) => item.name).join(', ');
      throw new Error(
        `Seeder "${targetSeederName}" was not found. Available seeders: ${availableSeeders}`,
      );
    }

    return [seeder];
  }

  private getTargetSeederName(): string | null {
    const npmConfigFileName =
      process.env.npm_config_filename?.trim() || process.env.npm_config_fileName?.trim();
    if (npmConfigFileName) {
      return npmConfigFileName;
    }

    const namedArgument = process.argv.find((argument) => argument.startsWith('--fileName='));
    if (namedArgument) {
      return namedArgument.split('=')[1]?.trim() || null;
    }

    const optionIndex = process.argv.findIndex((argument) => argument === '--fileName');
    if (optionIndex >= 0) {
      return process.argv[optionIndex + 1]?.trim() || null;
    }

    const positionalArgument = process.argv
      .slice(2)
      .find((argument) => argument.trim() && !argument.startsWith('--'));

    return positionalArgument?.trim() || null;
  }
}

void new DatabaseSeeder().run();
