import { DataSource } from 'typeorm';
import {
  seedUserWithRole,
  type SeedUserConfig,
  type SeedUserResult,
} from './helpers/seed-user-with-role';

export async function seedAgentUser(dataSource: DataSource): Promise<SeedUserResult> {
  return seedUserWithRole(dataSource, AGENT_SEED_CONFIG);
}

const AGENT_SEED_CONFIG: SeedUserConfig = {
  roleCode: 'agent',
  email: 'agent@example.com',
  password: 'Agent123!',
  firstName: 'Sales',
  lastName: 'Agent',
  fullName: 'Sales Agent',
  markEmailVerified: true,
  isActive: true,
};
