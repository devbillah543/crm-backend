import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../../core/cache/cache.service';
import { Role } from '../../database/entities/role.entity';

const ROLES_CACHE_NAMESPACE = 'roles';
const ROLES_CACHE_TTL_SECONDS = 3600;

@Injectable()
export class RolesService {
  constructor(
    private readonly cacheService: CacheService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll() {
    return this.cacheService.rememberVersioned(
      ROLES_CACHE_NAMESPACE,
      'findAll',
      ROLES_CACHE_TTL_SECONDS,
      async () => {
        const roles = await this.roleRepository.find({
          order: {
            isSystem: 'DESC',
            code: 'ASC',
          },
        });

        return roles.map((role) => ({
          id: role.id,
          code: role.code,
          displayName: role.displayName,
          description: role.description,
          isSystem: role.isSystem,
        }));
      },
    );
  }
}
