import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryFailedError, Repository, WhereExpressionBuilder } from 'typeorm';
import { normalizePagination } from '../../common/utils/pagination.util';
import { Brand } from '../../database/entities/brand.entity';
import { Organization } from '../../database/entities/organization.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { ListBrandsQueryDto } from './dto/list-brands-query.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async findAll(query: ListBrandsQueryDto) {
    const normalized = normalizePagination(query);
    const builder = this.brandRepository.createQueryBuilder('brand');

    if (query.search?.trim()) {
      const search = `%${query.search.trim().toLowerCase()}%`;
      builder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('LOWER(brand.code) LIKE :search', { search }).orWhere(
            'LOWER(brand.display_name) LIKE :search',
            { search },
          );
        }),
      );
    }

    if (query.organizationId) {
      builder.andWhere('brand.organization_id = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.isActive !== undefined) {
      builder.andWhere('brand.is_active = :isActive', { isActive: query.isActive });
    }

    const [brands, total] = await builder
      .orderBy('brand.created_at', 'DESC')
      .skip((normalized.page - 1) * normalized.limit)
      .take(normalized.limit)
      .getManyAndCount();

    return {
      items: brands.map((brand) => this.serialize(brand)),
      meta: {
        page: normalized.page,
        limit: normalized.limit,
        total,
      },
    };
  }

  async findOne(id: string) {
    const brand = await this.findByIdOrFail(id);
    return this.serialize(brand);
  }

  async create(dto: CreateBrandDto) {
    await this.ensureCodeIsUnique(dto.code);
    await this.ensureOrganizationExists(dto.organizationId);
    await this.validateParentBrand(null, dto.organizationId, dto.parentBrandId);

    const brand = this.brandRepository.create({
      organizationId: dto.organizationId,
      parentBrandId: dto.parentBrandId ?? null,
      code: normalizeCode(dto.code),
      displayName: dto.displayName.trim(),
      icon: normalizeOptionalString(dto.icon) ?? null,
      isActive: dto.isActive ?? true,
    });

    const savedBrand = await this.brandRepository.save(brand);
    return this.serialize(savedBrand);
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.findByIdOrFail(id);
    const nextOrganizationId = dto.organizationId ?? brand.organizationId;
    const nextParentBrandId = dto.parentBrandId !== undefined ? dto.parentBrandId : brand.parentBrandId;

    if (dto.code && normalizeCode(dto.code) !== brand.code) {
      await this.ensureCodeIsUnique(dto.code, id);
      brand.code = normalizeCode(dto.code);
    }

    if (dto.organizationId !== undefined && dto.organizationId !== brand.organizationId) {
      await this.ensureOrganizationExists(dto.organizationId);
      brand.organizationId = dto.organizationId;
    }

    await this.validateParentBrand(id, nextOrganizationId, nextParentBrandId ?? undefined);

    if (dto.parentBrandId !== undefined) {
      brand.parentBrandId = dto.parentBrandId ?? null;
    }

    if (dto.displayName !== undefined) {
      brand.displayName = dto.displayName.trim();
    }

    if (dto.icon !== undefined) {
      brand.icon = normalizeOptionalString(dto.icon) ?? null;
    }

    if (dto.isActive !== undefined) {
      brand.isActive = dto.isActive;
    }

    const savedBrand = await this.brandRepository.save(brand);
    return this.serialize(savedBrand);
  }

  async remove(id: string) {
    const brand = await this.findByIdOrFail(id);
    await this.brandRepository.softRemove(brand);
  }

  private async findByIdOrFail(id: string) {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  private async ensureCodeIsUnique(code: string, excludeId?: string) {
    const existing = await this.brandRepository.findOne({
      where: { code: normalizeCode(code) },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Brand code already exists');
    }
  }

  private async ensureOrganizationExists(organizationId: string) {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
  }

  private async validateParentBrand(
    brandId: string | null,
    organizationId: string,
    parentBrandId?: string | null,
  ) {
    if (parentBrandId === undefined) {
      return;
    }

    if (parentBrandId === null) {
      return;
    }

    if (brandId && parentBrandId === brandId) {
      throw new BadRequestException('Parent brand cannot reference the same brand');
    }

    const parentBrand = await this.brandRepository.findOne({
      where: { id: parentBrandId },
    });

    if (!parentBrand) {
      throw new NotFoundException('Parent brand not found');
    }

    if (parentBrand.organizationId !== organizationId) {
      throw new BadRequestException('Parent brand must belong to the same organization');
    }
  }

  private serialize(brand: Brand) {
    return {
      id: brand.id,
      organizationId: brand.organizationId,
      parentBrandId: brand.parentBrandId,
      code: brand.code,
      displayName: brand.displayName,
      icon: brand.icon,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
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
