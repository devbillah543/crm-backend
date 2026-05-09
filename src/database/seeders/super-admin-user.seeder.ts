import { DataSource } from 'typeorm';
import {
  seedUserWithRole,
  type SeedUserConfig,
  type SeedUserResult,
} from './helpers/seed-user-with-role';

export async function seedSuperAdminUser(dataSource: DataSource): Promise<SeedUserResult> {
  return seedUserWithRole(dataSource, SUPER_ADMIN_SEED_CONFIG);
}

const SUPER_ADMIN_SEED_CONFIG: SeedUserConfig = {
  roleCode: 'super_admin',
  email: 'superadmin@example.com',
  password: 'SuperAdmin123!',
  firstName: 'Super',
  lastName: 'Admin',
  fullName: 'Super Admin',
  markEmailVerified: true,
  isActive: true,
};
