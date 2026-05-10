import 'reflect-metadata';
import { exec } from 'child_process';
import { config as loadEnv } from 'dotenv';
import dataSource from '../core/database/database.datasource';
import { ensureDatabaseExists } from '../core/database/ensure-database';

loadEnv();

async function run(): Promise<void> {
  console.log('[migration:fresh] running');

  try {
    await ensureDatabaseExists();
    await resetSchema();
    await runTypeormMigrations();
    console.log('[migration:fresh] success');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[migration:fresh] error: ${message}`);
    process.exitCode = 1;
  }
}

async function resetSchema(): Promise<void> {
  await dataSource.initialize();

  try {
    await dataSource.query('DROP SCHEMA IF EXISTS public CASCADE');
    await dataSource.query('CREATE SCHEMA public');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

function runTypeormMigrations(): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = 'npm run typeorm:raw -- migration:run';
    const child = exec(command, { cwd: process.cwd(), env: process.env });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`migration:run command exited with code ${code ?? 'unknown'}`));
    });
    child.on('error', reject);
  });
}

void run();
