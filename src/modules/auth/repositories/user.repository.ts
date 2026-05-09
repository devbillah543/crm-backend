import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Permission } from '../../../database/entities/permission.entity';
import { Role } from '../../../database/entities/role.entity';
import { RolePermission } from '../../../database/entities/role-permission.entity';
import { UserRoleAssignment } from '../../../database/entities/user-role-assignment.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRoleAssignment)
    private readonly roleAssignmentRepository: Repository<UserRoleAssignment>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  create(values: Partial<User>): User {
    return this.repository.create(values);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async getRoleCodes(userId: string): Promise<string[]> {
    const assignments = await this.roleAssignmentRepository.find({
      select: { roleId: true },
      where: { userId },
    });

    if (assignments.length === 0) {
      return [];
    }

    const roles = await this.roleRepository.find({
      select: { code: true },
      where: { id: In(assignments.map((assignment) => assignment.roleId)) },
    });

    return roles.map((role) => role.code);
  }

  async getPermissionCodes(userId: string): Promise<string[]> {
    const assignments = await this.roleAssignmentRepository.find({
      select: { roleId: true },
      where: { userId },
    });

    if (assignments.length === 0) {
      return [];
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: In(assignments.map((assignment) => assignment.roleId)) },
    });

    if (rolePermissions.length === 0) {
      return [];
    }

    const permissions = await this.permissionRepository.find({
      select: { code: true },
      where: { id: In(rolePermissions.map((item) => item.permissionId)) },
    });

    return permissions.map((permission) => permission.code);
  }
}
