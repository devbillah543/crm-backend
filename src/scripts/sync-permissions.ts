import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import dataSource from '../core/database/database.datasource';
import { ensureDatabaseExists } from '../core/database/ensure-database';
import { syncPermissionsForDatabase } from '../database/seeders/helpers/sync-permissions.helper';

loadEnv();

async function syncPermissions(): Promise<void> {
  await syncPermissionsForDatabase(dataSource);
}

async function run(): Promise<void> {
  console.log('[sync:permission] running');

  try {
    await ensureDatabaseExists();
    await dataSource.initialize();
    await syncPermissions();
    console.log('[sync:permission] success');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[sync:permission] error: ${message}`);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void run();
