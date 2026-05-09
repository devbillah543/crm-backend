import { DataSource } from 'typeorm';
import {
  seedUserWithRole,
  type SeedUserConfig,
  type SeedUserResult,
} from './helpers/seed-user-with-role';

export async function seedAdminUser(dataSource: DataSource): Promise<SeedUserResult> {
  return seedUserWithRole(dataSource, ADMIN_SEED_CONFIG);
}

const ADMIN_SEED_CONFIG: SeedUserConfig = {
  roleCode: 'admin',
  email: 'admin@example.com',
  password: 'Admin123!',
  firstName: 'Platform',
  lastName: 'Admin',
  fullName: 'Platform Admin',
  markEmailVerified: true,
  isActive: true,
};
