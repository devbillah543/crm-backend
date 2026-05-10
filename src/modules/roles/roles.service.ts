import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll() {
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
  }
}
