import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { normalizePagination } from '../../common/utils/pagination.util';
import { JwtUser } from '../../common/types/jwt-user.type';
import { CacheService } from '../../core/cache/cache.service';
import { Company } from '../../database/entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const COMPANIES_CACHE_NAMESPACE = 'companies';
const COMPANIES_CACHE_TTL_SECONDS = 120;

@Injectable()
export class CompaniesService {
  constructor(
    private readonly cacheService: CacheService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(query: ListCompaniesQueryDto) {
    return this.cacheService.rememberVersioned(
      COMPANIES_CACHE_NAMESPACE,
      `findAll:${serializeCacheKey(query)}`,
      COMPANIES_CACHE_TTL_SECONDS,
      async () => {
        const normalized = normalizePagination(query);
        const builder = this.companyRepository.createQueryBuilder('company');

        if (query.search?.trim()) {
          const search = `%${query.search.trim().toLowerCase()}%`;
          builder.andWhere(
            new Brackets((qb: WhereExpressionBuilder) => {
              qb.where('LOWER(company.company_symbol) LIKE :search', { search })
                .orWhere('LOWER(company.company_name) LIKE :search', { search })
                .orWhere(
                  "LOWER(COALESCE(company.description, '')) LIKE :search",
                  { search },
                );
            }),
          );
        }

        if (query.companyType?.trim()) {
          builder.andWhere('LOWER(company.company_type) = :companyType', {
            companyType: query.companyType.trim().toLowerCase(),
          });
        }

        if (query.country?.trim()) {
          builder.andWhere('LOWER(company.country) = :country', {
            country: query.country.trim().toLowerCase(),
          });
        }

        const [companies, total] = await builder
          .orderBy('company.created_at', 'DESC')
          .skip((normalized.page - 1) * normalized.limit)
          .take(normalized.limit)
          .getManyAndCount();

        return {
          items: companies.map((company) => this.serialize(company)),
          meta: {
            page: normalized.page,
            limit: normalized.limit,
            total,
          },
        };
      },
    );
  }

  async findOne(id: string) {
    return this.cacheService.rememberVersioned(
      COMPANIES_CACHE_NAMESPACE,
      `findOne:${id}`,
      COMPANIES_CACHE_TTL_SECONDS,
      async () => {
        const company = await this.findByIdOrFail(id);
        return this.serialize(company);
      },
    );
  }

  async create(dto: CreateCompanyDto, user: JwtUser) {
    await this.ensureSymbolIsUnique(dto.companySymbol);

    const company = this.companyRepository.create({
      companySymbol: normalizeUppercase(dto.companySymbol),
      companyName: dto.companyName.trim(),
      companyType: normalizeOptionalString(dto.companyType) ?? null,
      previousCompanySymbol: normalizeOptionalUppercase(
        dto.previousCompanySymbol,
      ),
      previousCompanyName:
        normalizeOptionalString(dto.previousCompanyName) ?? null,
      cusip: normalizeOptionalString(dto.cusip) ?? null,
      cik: normalizeOptionalString(dto.cik) ?? null,
      country: normalizeOptionalString(dto.country) ?? null,
      city: normalizeOptionalString(dto.city) ?? null,
      state: normalizeOptionalString(dto.state) ?? null,
      zip: normalizeOptionalString(dto.zip) ?? null,
      timezone: normalizeOptionalString(dto.timezone) ?? null,
      website: normalizeOptionalString(dto.website) ?? null,
      icon: normalizeOptionalString(dto.icon) ?? null,
      twitter: normalizeOptionalString(dto.twitter) ?? null,
      description: normalizeOptionalString(dto.description) ?? null,
      estimatedMarketcap:
        normalizeOptionalString(dto.estimatedMarketcap) ?? null,
      createdByUserId: user.userId,
    });

    const savedCompany = await this.companyRepository.save(company);
    await this.cacheService.invalidateNamespace(COMPANIES_CACHE_NAMESPACE);
    return this.serialize(savedCompany);
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.findByIdOrFail(id);

    if (
      dto.companySymbol &&
      normalizeUppercase(dto.companySymbol) !== company.companySymbol
    ) {
      await this.ensureSymbolIsUnique(dto.companySymbol, id);
      company.companySymbol = normalizeUppercase(dto.companySymbol);
    }

    if (dto.companyName !== undefined) {
      company.companyName = dto.companyName.trim();
    }

    if (dto.companyType !== undefined) {
      company.companyType = normalizeOptionalString(dto.companyType) ?? null;
    }

    if (dto.previousCompanySymbol !== undefined) {
      company.previousCompanySymbol =
        normalizeOptionalUppercase(dto.previousCompanySymbol) ?? null;
    }

    if (dto.previousCompanyName !== undefined) {
      company.previousCompanyName =
        normalizeOptionalString(dto.previousCompanyName) ?? null;
    }

    if (dto.cusip !== undefined) {
      company.cusip = normalizeOptionalString(dto.cusip) ?? null;
    }

    if (dto.cik !== undefined) {
      company.cik = normalizeOptionalString(dto.cik) ?? null;
    }

    if (dto.country !== undefined) {
      company.country = normalizeOptionalString(dto.country) ?? null;
    }

    if (dto.city !== undefined) {
      company.city = normalizeOptionalString(dto.city) ?? null;
    }

    if (dto.state !== undefined) {
      company.state = normalizeOptionalString(dto.state) ?? null;
    }

    if (dto.zip !== undefined) {
      company.zip = normalizeOptionalString(dto.zip) ?? null;
    }

    if (dto.timezone !== undefined) {
      company.timezone = normalizeOptionalString(dto.timezone) ?? null;
    }

    if (dto.website !== undefined) {
      company.website = normalizeOptionalString(dto.website) ?? null;
    }

    if (dto.icon !== undefined) {
      company.icon = normalizeOptionalString(dto.icon) ?? null;
    }

    if (dto.twitter !== undefined) {
      company.twitter = normalizeOptionalString(dto.twitter) ?? null;
    }

    if (dto.description !== undefined) {
      company.description = normalizeOptionalString(dto.description) ?? null;
    }

    if (dto.estimatedMarketcap !== undefined) {
      company.estimatedMarketcap =
        normalizeOptionalString(dto.estimatedMarketcap) ?? null;
    }

    const savedCompany = await this.companyRepository.save(company);
    await this.cacheService.invalidateNamespace(COMPANIES_CACHE_NAMESPACE);
    return this.serialize(savedCompany);
  }

  async remove(id: string) {
    const company = await this.findByIdOrFail(id);
    await this.companyRepository.softRemove(company);
    await this.cacheService.invalidateNamespace(COMPANIES_CACHE_NAMESPACE);
  }

  private async findByIdOrFail(id: string) {
    const company = await this.companyRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  private async ensureSymbolIsUnique(symbol: string, excludeId?: string) {
    const existing = await this.companyRepository.findOne({
      where: { companySymbol: normalizeUppercase(symbol) },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Company symbol already exists');
    }
  }

  private serialize(company: Company) {
    return {
      id: company.id,
      companySymbol: company.companySymbol,
      companyName: company.companyName,
      companyType: company.companyType,
      previousCompanySymbol: company.previousCompanySymbol,
      previousCompanyName: company.previousCompanyName,
      cusip: company.cusip,
      cik: company.cik,
      country: company.country,
      city: company.city,
      state: company.state,
      zip: company.zip,
      timezone: company.timezone,
      website: company.website,
      icon: company.icon,
      twitter: company.twitter,
      description: company.description,
      estimatedMarketcap: company.estimatedMarketcap,
      createdByUserId: company.createdByUserId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}

function normalizeUppercase(value: string) {
  return value.trim().toUpperCase();
}

function normalizeOptionalUppercase(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return normalized ? normalized : null;
}

function normalizeOptionalString(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function serializeCacheKey(query: object) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
}
