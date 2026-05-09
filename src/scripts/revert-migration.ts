import 'reflect-metadata';
import { exec } from 'child_process';
import { config as loadEnv } from 'dotenv';

loadEnv();

async function run(): Promise<void> {
  console.log('[migration:revert] running');

  try {
    await runTypeormRevert();
    console.log('[migration:revert] success');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[migration:revert] error: ${message}`);
    process.exitCode = 1;
  }
}

function runTypeormRevert(): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = 'npm run typeorm:raw -- migration:revert';
    const child = exec(command, { cwd: process.cwd(), env: process.env });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`migration:revert command exited with code ${code ?? 'unknown'}`));
    });
    child.on('error', reject);
  });
}

void run();
