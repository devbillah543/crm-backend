import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { UserRoleAssignment } from '../../entities/user-role-assignment.entity';
import { User } from '../../entities/user.entity';
import type { SeedExecutionResult } from '../types/seeder.type';

export interface SeedUserConfig {
  roleCode: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  isActive?: boolean;
  markEmailVerified?: boolean;
}

export interface SeedUserResult extends SeedExecutionResult {
  email: string;
  roleCode: string;
}

export async function seedUserWithRole(
  dataSource: DataSource,
  config: SeedUserConfig | null,
): Promise<SeedUserResult> {
  if (!config) {
    return {
      email: '',
      roleCode: '',
      created: false,
      updated: false,
      skipped: true,
      reason: 'Seed config is missing required values.',
    };
  }

  return dataSource.transaction(async (manager) => {
    const roleRepository = manager.getRepository(Role);
    const userRepository = manager.getRepository(User);
    const assignmentRepository = manager.getRepository(UserRoleAssignment);

    const role = await roleRepository.findOne({
      where: { code: config.roleCode },
    });

    if (!role) {
      return {
        email: config.email,
        roleCode: config.roleCode,
        created: false,
        updated: false,
        skipped: true,
        reason: `Role "${config.roleCode}" was not found. Run npm run sync:permission first.`,
      };
    }

    const normalizedEmail = config.email.trim().toLowerCase();
    const passwordHash = await hash(config.password, 12);
    const existingUser = await userRepository.findOne({
      where: { email: normalizedEmail },
    });

    let user: User;
    let created = false;
    let updated = false;

    if (existingUser) {
      existingUser.firstName = config.firstName;
      existingUser.lastName = config.lastName;
      existingUser.fullName =
        config.fullName ?? `${config.firstName} ${config.lastName}`.trim();
      existingUser.passwordHash = passwordHash;
      existingUser.passwordChangedAt = new Date();
      existingUser.isActive = config.isActive ?? true;
      existingUser.emailVerifiedAt = config.markEmailVerified === false ? null : new Date();
      user = await userRepository.save(existingUser);
      updated = true;
    } else {
      user = userRepository.create({
        email: normalizedEmail,
        firstName: config.firstName,
        lastName: config.lastName,
        fullName: config.fullName ?? `${config.firstName} ${config.lastName}`.trim(),
        passwordHash,
        passwordChangedAt: new Date(),
        isActive: config.isActive ?? true,
        emailVerifiedAt: config.markEmailVerified === false ? null : new Date(),
      });
      user = await userRepository.save(user);
      created = true;
    }

    const existingAssignment = await assignmentRepository.findOne({
      where: {
        userId: user.id,
        roleId: role.id,
      },
    });

    if (!existingAssignment) {
      const assignment = assignmentRepository.create({
        userId: user.id,
        roleId: role.id,
        brandId: null,
        assignedAt: new Date(),
        assignedByUserId: null,
      });
      await assignmentRepository.save(assignment);
    }

    return {
      email: normalizedEmail,
      roleCode: config.roleCode,
      created,
      updated,
      skipped: false,
    };
  });
}
