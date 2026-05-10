import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { normalizePagination } from '../../common/utils/pagination.util';
import { Brand } from '../../database/entities/brand.entity';
import { Organization } from '../../database/entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations-query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll(query: ListOrganizationsQueryDto) {
    const normalized = normalizePagination(query);
    const builder = this.organizationRepository.createQueryBuilder('organization');

    if (query.search?.trim()) {
      const search = `%${query.search.trim().toLowerCase()}%`;
      builder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('LOWER(organization.code) LIKE :search', { search }).orWhere(
            'LOWER(organization.display_name) LIKE :search',
            { search },
          );
        }),
      );
    }

    if (query.isActive !== undefined) {
      builder.andWhere('organization.is_active = :isActive', { isActive: query.isActive });
    }

    const [organizations, total] = await builder
      .orderBy('organization.created_at', 'DESC')
      .skip((normalized.page - 1) * normalized.limit)
      .take(normalized.limit)
      .getManyAndCount();

    return {
      items: organizations.map((organization) => this.serialize(organization)),
      meta: {
        page: normalized.page,
        limit: normalized.limit,
        total,
      },
    };
  }

  async findOne(id: string) {
    const organization = await this.findByIdOrFail(id);
    return this.serialize(organization);
  }

  async create(dto: CreateOrganizationDto) {
    await this.ensureCodeIsUnique(dto.code);

    const organization = this.organizationRepository.create({
      code: normalizeCode(dto.code),
      displayName: dto.displayName.trim(),
      description: normalizeOptionalString(dto.description),
      icon: normalizeOptionalString(dto.icon),
      isActive: dto.isActive ?? true,
    });

    const savedOrganization = await this.organizationRepository.save(organization);
    return this.serialize(savedOrganization);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const organization = await this.findByIdOrFail(id);

    if (dto.code && normalizeCode(dto.code) !== organization.code) {
      await this.ensureCodeIsUnique(dto.code, id);
      organization.code = normalizeCode(dto.code);
    }

    if (dto.displayName !== undefined) {
      organization.displayName = dto.displayName.trim();
    }

    if (dto.description !== undefined) {
      organization.description = normalizeOptionalString(dto.description) ?? null;
    }

    if (dto.icon !== undefined) {
      organization.icon = normalizeOptionalString(dto.icon) ?? null;
    }

    if (dto.isActive !== undefined) {
      organization.isActive = dto.isActive;
    }

    const savedOrganization = await this.organizationRepository.save(organization);
    return this.serialize(savedOrganization);
  }

  async remove(id: string) {
    const organization = await this.findByIdOrFail(id);
    const brandCount = await this.brandRepository.count({
      where: { organizationId: organization.id },
    });

    if (brandCount > 0) {
      throw new ConflictException('Organization cannot be deleted while brands are assigned to it');
    }

    await this.organizationRepository.softRemove(organization);
  }

  private async findByIdOrFail(id: string) {
    const organization = await this.organizationRepository.findOne({ where: { id } });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  private async ensureCodeIsUnique(code: string, excludeId?: string) {
    const existing = await this.organizationRepository.findOne({
      where: { code: normalizeCode(code) },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Organization code already exists');
    }
  }

  private serialize(organization: Organization) {
    return {
      id: organization.id,
      code: organization.code,
      displayName: organization.displayName,
      description: organization.description,
      icon: organization.icon,
      isActive: organization.isActive,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}

function normalizeCode(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOptionalString(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}
