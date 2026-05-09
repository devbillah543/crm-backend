import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { In } from 'typeorm';
import {
  PERMISSION_DEFINITIONS,
  ROLE_DEFINITIONS,
} from '../config/permission.config';
import dataSource from '../core/database/database.datasource';
import { ensureDatabaseExists } from '../core/database/ensure-database';
import { Permission } from '../database/entities/permission.entity';
import { Role } from '../database/entities/role.entity';
import { RolePermission } from '../database/entities/role-permission.entity';

loadEnv();

async function syncPermissions(): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const permissionRepository = manager.getRepository(Permission);
    const roleRepository = manager.getRepository(Role);
    const rolePermissionRepository = manager.getRepository(RolePermission);

    const existingPermissions = await permissionRepository.find({
      where: { code: In(PERMISSION_DEFINITIONS.map((permission) => permission.code)) },
    });
    const existingPermissionMap = new Map(
      existingPermissions.map((permission) => [permission.code, permission]),
    );

    for (const definition of PERMISSION_DEFINITIONS) {
      const existing = existingPermissionMap.get(definition.code);
      if (existing) {
        existing.displayName = definition.displayName;
        existing.description = definition.description;
        existing.category = definition.module;
        await permissionRepository.save(existing);
        continue;
      }

      const permission = permissionRepository.create({
        code: definition.code,
        displayName: definition.displayName,
        description: definition.description,
        category: definition.module,
      });
      await permissionRepository.save(permission);
    }

    const refreshedPermissions = await permissionRepository.find({
      where: { code: In(PERMISSION_DEFINITIONS.map((permission) => permission.code)) },
    });
    const permissionIdByCode = new Map(
      refreshedPermissions.map((permission) => [permission.code, permission.id]),
    );

    const existingRoles = await roleRepository.find({
      where: { code: In(ROLE_DEFINITIONS.map((role) => role.code)) },
    });
    const existingRoleMap = new Map(existingRoles.map((role) => [role.code, role]));

    for (const definition of ROLE_DEFINITIONS) {
      const existing = existingRoleMap.get(definition.code);
      if (existing) {
        existing.displayName = definition.displayName;
        existing.description = definition.description;
        existing.isSystem = definition.isSystem;
        await roleRepository.save(existing);
        continue;
      }

      const role = roleRepository.create({
        code: definition.code,
        displayName: definition.displayName,
        description: definition.description,
        isSystem: definition.isSystem,
      });
      await roleRepository.save(role);
    }

    const refreshedRoles = await roleRepository.find({
      where: { code: In(ROLE_DEFINITIONS.map((role) => role.code)) },
    });
    const roleIdByCode = new Map(refreshedRoles.map((role) => [role.code, role.id]));

    for (const definition of ROLE_DEFINITIONS) {
      const roleId = roleIdByCode.get(definition.code);
      if (!roleId) {
        continue;
      }

      await rolePermissionRepository.delete({ roleId });

      const mappings = definition.permissions
        .map((permissionCode) => permissionIdByCode.get(permissionCode))
        .filter((permissionId): permissionId is string => Boolean(permissionId))
        .map((permissionId) =>
          rolePermissionRepository.create({
            roleId,
            permissionId,
          }),
        );

      if (mappings.length > 0) {
        await rolePermissionRepository.save(mappings);
      }
    }
  });
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
