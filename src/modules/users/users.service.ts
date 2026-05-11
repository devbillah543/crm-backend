import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Brackets, In, Repository, WhereExpressionBuilder } from 'typeorm';
import { normalizePagination } from '../../common/utils/pagination.util';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { StorageService } from '../../core/storage/storage.service';
import { AuthActionToken } from '../../database/entities/auth-action-token.entity';
import { Brand } from '../../database/entities/brand.entity';
import { Permission } from '../../database/entities/permission.entity';
import { RolePermission } from '../../database/entities/role-permission.entity';
import { Role } from '../../database/entities/role.entity';
import { UserBrand } from '../../database/entities/user-brand.entity';
import { UserRoleAssignment } from '../../database/entities/user-role-assignment.entity';
import { UserSession } from '../../database/entities/user-session.entity';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignment>,
    @InjectRepository(UserBrand)
    private readonly userBrandRepository: Repository<UserBrand>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(AuthActionToken)
    private readonly authActionTokenRepository: Repository<AuthActionToken>,
  ) {}

  async findAll(query: ListUsersQueryDto) {
    const normalized = normalizePagination(query);
    const builder = this.userRepository.createQueryBuilder('user');

    if (query.search?.trim()) {
      const search = `%${query.search.trim().toLowerCase()}%`;
      builder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('LOWER(user.email) LIKE :search', { search })
            .orWhere("LOWER(COALESCE(user.first_name, '')) LIKE :search", {
              search,
            })
            .orWhere("LOWER(COALESCE(user.last_name, '')) LIKE :search", {
              search,
            })
            .orWhere("LOWER(COALESCE(user.full_name, '')) LIKE :search", {
              search,
            });
        }),
      );
    }

    if (query.isActive !== undefined) {
      builder.andWhere('user.is_active = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.roleCode?.trim()) {
      builder.andWhere(
        `user.id IN (
          SELECT ura.user_id
          FROM user_role_assignments ura
          INNER JOIN roles role_filter ON role_filter.id = ura.role_id
          WHERE LOWER(role_filter.code) = :roleCode
        )`,
        {
          roleCode: query.roleCode.trim().toLowerCase(),
        },
      );
    }

    const [users, total] = await builder
      .orderBy('user.created_at', 'DESC')
      .skip((normalized.page - 1) * normalized.limit)
      .take(normalized.limit)
      .getManyAndCount();

    const serialized = await this.serializeUsers(users);

    return {
      items: serialized,
      meta: {
        page: normalized.page,
        limit: normalized.limit,
        total,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.findUserOrFail(id);
    const [serialized] = await this.serializeUsers([user]);
    return serialized;
  }

  async create(dto: CreateUserDto, currentUser: JwtUser) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    await this.ensureEmailIsUnique(normalizedEmail);
    const roles = await this.resolveRoles(dto.roleIds);
    await this.ensureBrandsExist(dto.brandIds);

    const passwordHash = await hash(
      dto.password,
      this.configService.get<number>('auth.bcryptRounds', 12),
    );

    const user = this.userRepository.create({
      email: normalizedEmail,
      firstName: normalizeOptionalString(dto.firstName) ?? null,
      lastName: normalizeOptionalString(dto.lastName) ?? null,
      fullName: resolveFullName(dto.firstName, dto.lastName, dto.fullName),
      passwordHash,
      passwordChangedAt: new Date(),
      isActive: dto.isActive ?? true,
      emailVerifiedAt: null,
      verificationEmailSentAt: null,
    });

    const savedUser = await this.userRepository.save(user);
    await this.syncUserRoles(savedUser.id, roles, currentUser.userId);
    await this.syncUserBrands(savedUser.id, dto.brandIds ?? []);

    return this.findOne(savedUser.id);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: JwtUser) {
    const user = await this.findUserOrFail(id);

    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      await this.ensureEmailIsUnique(normalizedEmail, user.id);
      user.email = normalizedEmail;
      user.emailVerifiedAt = null;
      user.verificationEmailSentAt = null;
      await this.authActionTokenRepository.delete({ userId: user.id });
    }

    if (dto.firstName !== undefined) {
      user.firstName = normalizeOptionalString(dto.firstName) ?? null;
    }

    if (dto.lastName !== undefined) {
      user.lastName = normalizeOptionalString(dto.lastName) ?? null;
    }

    if (dto.fullName !== undefined) {
      user.fullName = normalizeOptionalString(dto.fullName) ?? null;
    } else if (dto.firstName !== undefined || dto.lastName !== undefined) {
      user.fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
      if (!dto.isActive) {
        await this.revokeAllUserSessions(user.id, 'user_deactivated');
      }
    }

    if (dto.password !== undefined) {
      user.passwordHash = await hash(
        dto.password,
        this.configService.get<number>('auth.bcryptRounds', 12),
      );
      user.passwordChangedAt = new Date();
      await this.revokeAllUserSessions(user.id, 'password_changed_by_admin');
    }

    if (dto.roleIds !== undefined) {
      const roles = await this.resolveRoles(dto.roleIds);
      await this.syncUserRoles(user.id, roles, currentUser.userId);
    }

    if (dto.brandIds !== undefined) {
      await this.ensureBrandsExist(dto.brandIds);
      await this.syncUserBrands(user.id, dto.brandIds);
    }

    await this.userRepository.save(user);
    return this.findOne(user.id);
  }

  async remove(id: string, currentUser: JwtUser) {
    if (id === currentUser.userId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const user = await this.findUserOrFail(id);

    await this.revokeAllUserSessions(user.id, 'user_deleted');
    user.isActive = false;
    await this.userRepository.save(user);
    await this.userRepository.softRemove(user);
  }

  private async findUserOrFail(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async ensureEmailIsUnique(email: string, excludeId?: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Email is already in use');
    }
  }

  private async resolveRoles(roleIds?: string[]) {
    const normalizedIds = [
      ...new Set((roleIds ?? []).map((id) => id.trim()).filter(Boolean)),
    ];
    if (!normalizedIds.length) {
      return [];
    }

    const roles = await this.roleRepository.find({
      where: { id: In(normalizedIds) },
    });

    if (roles.length !== normalizedIds.length) {
      const foundIds = new Set(roles.map((role) => role.id));
      const missingIds = normalizedIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Unknown role ids: ${missingIds.join(', ')}`,
      );
    }

    return roles;
  }

  private async ensureBrandsExist(brandIds?: string[]) {
    if (!brandIds?.length) {
      return;
    }

    const normalizedIds = [...new Set(brandIds)];
    const brands = await this.brandRepository.find({
      where: { id: In(normalizedIds) },
      select: { id: true },
    });

    if (brands.length !== normalizedIds.length) {
      const foundIds = new Set(brands.map((brand) => brand.id));
      const missingIds = normalizedIds.filter(
        (brandId) => !foundIds.has(brandId),
      );
      throw new BadRequestException(
        `Unknown brand ids: ${missingIds.join(', ')}`,
      );
    }
  }

  private async syncUserRoles(
    userId: string,
    roles: Role[],
    assignedByUserId: string,
  ) {
    await this.userRoleAssignmentRepository.delete({ userId });

    if (!roles.length) {
      return;
    }

    const assignments = roles.map((role) =>
      this.userRoleAssignmentRepository.create({
        userId,
        roleId: role.id,
        brandId: null,
        assignedAt: new Date(),
        assignedByUserId,
      }),
    );

    await this.userRoleAssignmentRepository.save(assignments);
  }

  private async syncUserBrands(userId: string, brandIds: string[]) {
    await this.userBrandRepository.delete({ userId });

    const normalizedIds = [...new Set(brandIds)];
    if (!normalizedIds.length) {
      return;
    }

    const mappings = normalizedIds.map((brandId) =>
      this.userBrandRepository.create({
        userId,
        brandId,
        isActive: true,
        assignedAt: new Date(),
      }),
    );

    await this.userBrandRepository.save(mappings);
  }

  private async revokeAllUserSessions(userId: string, reason: string) {
    await this.userSessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where('"user_id" = :userId', { userId })
      .andWhere('"revoked_at" IS NULL')
      .execute();
  }

  private async serializeUsers(users: User[]) {
    if (!users.length) {
      return [];
    }

    const userIds = users.map((user) => user.id);
    const roleAssignments = await this.userRoleAssignmentRepository.find({
      where: { userId: In(userIds) },
    });
    const userBrands = await this.userBrandRepository.find({
      where: { userId: In(userIds) },
    });

    const roleIds = [
      ...new Set(roleAssignments.map((assignment) => assignment.roleId)),
    ];
    const roles = roleIds.length
      ? await this.roleRepository.find({
          where: { id: In(roleIds) },
        })
      : [];
    const roleMap = new Map(roles.map((role) => [role.id, role]));

    const rolePermissions = roleIds.length
      ? await this.rolePermissionRepository.find({
          where: { roleId: In(roleIds) },
        })
      : [];
    const permissionIds = [
      ...new Set(rolePermissions.map((item) => item.permissionId)),
    ];
    const permissions = permissionIds.length
      ? await this.permissionRepository.find({
          where: { id: In(permissionIds) },
        })
      : [];
    const permissionMap = new Map(
      permissions.map((permission) => [permission.id, permission.code]),
    );

    const roleCodesByUserId = new Map<string, string[]>();
    const permissionCodesByUserId = new Map<string, string[]>();
    const brandIdsByUserId = new Map<string, string[]>();
    const rolePermissionsByRoleId = new Map<string, string[]>();

    for (const rolePermission of rolePermissions) {
      const list = rolePermissionsByRoleId.get(rolePermission.roleId) ?? [];
      const permissionCode = permissionMap.get(rolePermission.permissionId);
      if (permissionCode) {
        list.push(permissionCode);
      }
      rolePermissionsByRoleId.set(rolePermission.roleId, list);
    }

    for (const assignment of roleAssignments) {
      const roleCodes = roleCodesByUserId.get(assignment.userId) ?? [];
      const permissionCodes =
        permissionCodesByUserId.get(assignment.userId) ?? [];
      const role = roleMap.get(assignment.roleId);
      if (role) {
        roleCodes.push(role.code);
        permissionCodes.push(
          ...(rolePermissionsByRoleId.get(assignment.roleId) ?? []),
        );
      }
      roleCodesByUserId.set(assignment.userId, roleCodes);
      permissionCodesByUserId.set(assignment.userId, permissionCodes);
    }

    for (const mapping of userBrands) {
      const brandIds = brandIdsByUserId.get(mapping.userId) ?? [];
      brandIds.push(mapping.brandId);
      brandIdsByUserId.set(mapping.userId, brandIds);
    }

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatarUrl: user.avatarKey
        ? this.storageService.url(user.avatarKey)
        : null,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      emailVerifiedAt: user.emailVerifiedAt
        ? user.emailVerifiedAt.toISOString()
        : null,
      isActive: user.isActive,
      roles: [...new Set(roleCodesByUserId.get(user.id) ?? [])],
      permissions: [
        ...new Set(permissionCodesByUserId.get(user.id) ?? []),
      ].sort(),
      brandIds: [...new Set(brandIdsByUserId.get(user.id) ?? [])],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }
}

function normalizeOptionalString(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function resolveFullName(
  firstName?: string,
  lastName?: string,
  fullName?: string,
) {
  const explicit = normalizeOptionalString(fullName);
  if (explicit !== undefined) {
    return explicit;
  }

  return (
    [normalizeOptionalString(firstName), normalizeOptionalString(lastName)]
      .filter(Boolean)
      .join(' ') || null
  );
}
