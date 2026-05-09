import { DataSource } from 'typeorm';
import {
  seedUserWithRole,
  type SeedUserConfig,
  type SeedUserResult,
} from './helpers/seed-user-with-role';

export async function seedManagerUser(dataSource: DataSource): Promise<SeedUserResult> {
  return seedUserWithRole(dataSource, MANAGER_SEED_CONFIG);
}

const MANAGER_SEED_CONFIG: SeedUserConfig = {
  roleCode: 'manager',
  email: 'manager@example.com',
  password: 'Manager123!',
  firstName: 'Team',
  lastName: 'Manager',
  fullName: 'Team Manager',
  markEmailVerified: true,
  isActive: true,
};
