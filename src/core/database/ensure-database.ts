import { Client } from 'pg';

export async function ensureDatabaseExists(): Promise<void> {
  const databaseUrl = readEnv('DATABASE_URL');
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  const targetUrl = new URL(databaseUrl);
  const targetDatabase = decodeURIComponent(targetUrl.pathname.replace(/^\//, ''));

  if (!targetDatabase) {
    throw new Error('DATABASE_URL must include a database name.');
  }

  const databaseAdminUrl = readEnv('DATABASE_ADMIN_URL');
  const adminUrl = new URL(databaseAdminUrl ?? databaseUrl);
  if (!databaseAdminUrl) {
    adminUrl.pathname = '/postgres';
  }

  const client = new Client({
    connectionString: adminUrl.toString(),
  });

  try {
    await client.connect();

    const existingDatabase = await client.query<{ exists: boolean }>(
      'select exists(select 1 from pg_database where datname = $1) as "exists"',
      [targetDatabase],
    );

    if (existingDatabase.rows[0]?.exists) {
      return;
    }

    try {
      const escapedDatabaseName = targetDatabase.replace(/"/g, '""');
      await client.query(`create database "${escapedDatabaseName}"`);
    } catch (error) {
      throw new Error(buildMissingDatabaseMessage(targetDatabase, error));
    }
  } finally {
    await client.end();
  }
}

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function buildMissingDatabaseMessage(targetDatabase: string, error: unknown): string {
  const pgError = error as { code?: string; message?: string };
  const details = pgError?.message ? ` PostgreSQL said: ${pgError.message}` : '';

  if (pgError?.code === '42501') {
    return `Database "${targetDatabase}" does not exist, and the current PostgreSQL user does not have permission to create it.${details} Please create the database manually, or provide a privileged DATABASE_ADMIN_URL.`;
  }

  return `Database "${targetDatabase}" does not exist and could not be created automatically.${details} Please create the database manually, or provide a working DATABASE_ADMIN_URL with permission to create databases.`;
}
