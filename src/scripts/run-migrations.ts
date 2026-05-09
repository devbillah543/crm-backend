import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import dataSource from '../core/database/database.datasource';
import { ensureDatabaseExists } from '../core/database/ensure-database';

loadEnv();

async function run(): Promise<void> {
  await ensureDatabaseExists();
  await dataSource.initialize();

  try {
    await dataSource.runMigrations();
  } finally {
    await dataSource.destroy();
  }
}

void run();
