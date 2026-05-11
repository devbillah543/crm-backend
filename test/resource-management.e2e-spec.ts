process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgres://root:secure_password@localhost:5432/sidago_test';
process.env.STORAGE_LOCAL_BASE_URL =
  process.env.STORAGE_LOCAL_BASE_URL ?? '/storage/local';

import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';

require('reflect-metadata');

const request = require('supertest');
const { Client } = require('pg');
const {
  Global,
  Module,
  ValidationPipe,
  VersioningType,
} = require('@nestjs/common');
const { Test } = require('@nestjs/testing');
const { ConfigModule } = require('@nestjs/config');
const { DataSource: TypeOrmDataSource } = require('typeorm');

const appConfig = require('../src/config/app.config').default;
const authConfig = require('../src/config/auth.config').default;
const databaseConfig = require('../src/config/database.config').default;
const jwtConfig = require('../src/config/jwt.config').default;
const mailerConfig = require('../src/config/mailer.config').default;
const queueConfig = require('../src/config/queue.config').default;
const redisConfig = require('../src/config/redis.config').default;
const storageConfig = require('../src/config/storage.config').default;
const throttleConfig = require('../src/config/throttle.config').default;
const websocketConfig = require('../src/config/websocket.config').default;
const { envValidationSchema } = require('../src/config/env.validation');
const { DatabaseModule } = require('../src/core/database/database.module');
const { QueueService } = require('../src/core/queue/queue.service');
const { RedisService } = require('../src/core/redis/redis.service');
const { StorageService } = require('../src/core/storage/storage.service');
const { WebsocketService } = require('../src/core/websocket/websocket.service');
const { AppLoggerService } = require('../src/core/logger/logger.service');
const {
  ResponseTransformInterceptor,
} = require('../src/common/interceptors/response-transform.interceptor');
const {
  GlobalExceptionFilter,
} = require('../src/common/filters/global-exception.filter');
const {
  ensureDatabaseExists,
} = require('../src/core/database/ensure-database');
const setupDataSource =
  require('../src/core/database/database.datasource').default;
const { AuthModule } = require('../src/modules/auth/auth.module');
const { RolesModule } = require('../src/modules/roles/roles.module');
const {
  OrganizationsModule,
} = require('../src/modules/organizations/organizations.module');
const {
  CompaniesModule,
} = require('../src/modules/companies/companies.module');
const { BrandsModule } = require('../src/modules/brands/brands.module');
const { UsersModule } = require('../src/modules/users/users.module');
const {
  seedSuperAdminUser,
} = require('../src/database/seeders/super-admin-user.seeder');
const { seedAdminUser } = require('../src/database/seeders/admin-user.seeder');
const {
  seedManagerUser,
} = require('../src/database/seeders/manager-user.seeder');
const {
  syncPermissionsForDatabase,
} = require('../src/database/seeders/helpers/sync-permissions.helper');
const {
  seedUserWithRole,
} = require('../src/database/seeders/helpers/seed-user-with-role');

const AUTH_BASE_PATH = '/api/v1/auth';
const ROLES_BASE_PATH = '/api/v1/roles';
const ORGANIZATIONS_BASE_PATH = '/api/v1/organizations';
const COMPANIES_BASE_PATH = '/api/v1/companies';
const BRANDS_BASE_PATH = '/api/v1/brands';
const USERS_BASE_PATH = '/api/v1/users';
const SUPER_ADMIN_EMAIL = 'superadmin@example.com';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';
const MANAGER_EMAIL = 'manager@example.com';
const MANAGER_PASSWORD = 'Manager123!';
const AGENT_EMAIL = 'agent@example.com';
const AGENT_PASSWORD = 'Agent123!';
const AGENT_SEED_CONFIG = {
  roleCode: 'agent',
  email: AGENT_EMAIL,
  password: AGENT_PASSWORD,
  firstName: 'Sales',
  lastName: 'Agent',
  fullName: 'Sales Agent',
  markEmailVerified: true,
  isActive: true,
};

const TEST_STORAGE_BASE_URL =
  process.env.STORAGE_LOCAL_BASE_URL ?? '/storage/local';

type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

type RoleSummary = {
  id: string;
  code: string;
};

const queueServiceMock = {
  enqueueMail: jest.fn(async () => undefined),
  enqueueNotification: jest.fn(async () => undefined),
  enqueueAnalytics: jest.fn(async () => undefined),
};

const redisServiceMock = {
  get: jest.fn(async () => null),
  set: jest.fn(async () => undefined),
  del: jest.fn(async () => undefined),
  incr: jest.fn(async () => 1),
  getClient: jest.fn(),
  onModuleDestroy: jest.fn(async () => undefined),
};

const websocketServiceMock = {
  emitToUser: jest.fn(),
  emitToRole: jest.fn(),
};

const storageServiceMock = {
  activeDriver: 'local',
  putBuffer: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(async () => false),
  read: jest.fn(async () => Buffer.alloc(0)),
  url: jest.fn((key: string) => `${TEST_STORAGE_BASE_URL}/${key}`),
};

const loggerMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

@Global()
@Module({
  providers: [
    { provide: QueueService, useValue: queueServiceMock },
    { provide: RedisService, useValue: redisServiceMock },
    { provide: StorageService, useValue: storageServiceMock },
    { provide: WebsocketService, useValue: websocketServiceMock },
    { provide: AppLoggerService, useValue: loggerMock },
  ],
  exports: [
    QueueService,
    RedisService,
    StorageService,
    WebsocketService,
    AppLoggerService,
  ],
})
class MockInfrastructureModule {}

describe('Resource management APIs (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    await prepareDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [
            appConfig,
            authConfig,
            databaseConfig,
            jwtConfig,
            mailerConfig,
            queueConfig,
            redisConfig,
            storageConfig,
            throttleConfig,
            websocketConfig,
          ],
          validationSchema: envValidationSchema,
        }),
        DatabaseModule,
        MockInfrastructureModule,
        AuthModule,
        RolesModule,
        OrganizationsModule,
        CompaniesModule,
        BrandsModule,
        UsersModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter(loggerMock));
    await app.init();

    dataSource = app.get(TypeOrmDataSource);
  });

  beforeEach(async () => {
    await resetState();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('allows only super admin and admin to list roles', async () => {
    const superAdmin = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    const admin = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);
    const manager = await loginAs(MANAGER_EMAIL, MANAGER_PASSWORD);

    const superAdminResponse = await api()
      .get(ROLES_BASE_PATH)
      .set('Authorization', `Bearer ${superAdmin.accessToken}`)
      .expect(200);

    expect(superAdminResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'super_admin' }),
        expect.objectContaining({ code: 'admin' }),
      ]),
    );

    await api()
      .get(ROLES_BASE_PATH)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    await api()
      .get(ROLES_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(403);
  });

  it('enforces organization permissions, validation, and duplicate-code conflicts', async () => {
    const manager = await loginAs(MANAGER_EMAIL, MANAGER_PASSWORD);
    const agent = await loginAs(AGENT_EMAIL, AGENT_PASSWORD);

    await api()
      .get(ORGANIZATIONS_BASE_PATH)
      .set('Authorization', `Bearer ${agent.accessToken}`)
      .expect(403);

    const createResponse = await api()
      .post(ORGANIZATIONS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        code: 'sidago',
        displayName: 'Sidago',
        description: 'Main organization',
        icon: '/storage/local/media/organizations/sidago.png',
      })
      .expect(201);

    expect(createResponse.body.data).toMatchObject({
      code: 'sidago',
      displayName: 'Sidago',
      description: 'Main organization',
      icon: '/storage/local/media/organizations/sidago.png',
      isActive: true,
    });

    const organizationId = createResponse.body.data.id;

    await api()
      .post(ORGANIZATIONS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        code: 'sidago',
        displayName: 'Sidago Duplicate',
      })
      .expect(409);

    const invalidResponse = await api()
      .post(ORGANIZATIONS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        code: 'x',
        displayName: 'Test',
        injected: true,
      })
      .expect(400);

    expect(invalidResponse.body.message).toEqual(
      expect.arrayContaining([
        'code must be longer than or equal to 2 characters',
        'property injected should not exist',
      ]),
    );

    const listResponse = await api()
      .get(
        `${ORGANIZATIONS_BASE_PATH}?search=sidago&isActive=true&page=1&limit=10`,
      )
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    expect(listResponse.body.data.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
    });
    expect(listResponse.body.data.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: organizationId })]),
    );

    await api()
      .get(`${ORGANIZATIONS_BASE_PATH}/${organizationId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    const updateResponse = await api()
      .patch(`${ORGANIZATIONS_BASE_PATH}/${organizationId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        displayName: 'Sidago CRM',
        icon: '',
      })
      .expect(200);

    expect(updateResponse.body.data).toMatchObject({
      displayName: 'Sidago CRM',
      icon: null,
    });
  });

  it('validates brand relations and blocks deleting an organization while brands exist', async () => {
    const manager = await loginAs(MANAGER_EMAIL, MANAGER_PASSWORD);
    const agent = await loginAs(AGENT_EMAIL, AGENT_PASSWORD);

    const firstOrganization = await createOrganization(manager.accessToken, {
      code: 'org-one',
      displayName: 'Org One',
    });
    const secondOrganization = await createOrganization(manager.accessToken, {
      code: 'org-two',
      displayName: 'Org Two',
    });

    await api()
      .get(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${agent.accessToken}`)
      .expect(403);

    const parentBrand = await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: firstOrganization.id,
        code: 'brand-parent',
        displayName: 'Brand Parent',
      })
      .expect(201);

    expect(parentBrand.body.data).toMatchObject({
      organizationId: firstOrganization.id,
      code: 'brand-parent',
      displayName: 'Brand Parent',
    });

    const foreignParent = await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: secondOrganization.id,
        code: 'brand-foreign-parent',
        displayName: 'Brand Foreign Parent',
      })
      .expect(201);

    await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: firstOrganization.id,
        code: 'brand-parent',
        displayName: 'Duplicate Brand',
      })
      .expect(409);

    await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: 'de305d54-75b4-431b-adb2-eb6b9e546014',
        code: 'brand-missing-org',
        displayName: 'Missing Org Brand',
      })
      .expect(404);

    const mismatchResponse = await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: firstOrganization.id,
        parentBrandId: foreignParent.body.data.id,
        code: 'brand-child',
        displayName: 'Brand Child',
      })
      .expect(400);

    expect(mismatchResponse.body.message).toBe(
      'Parent brand must belong to the same organization',
    );

    const childBrand = await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: firstOrganization.id,
        parentBrandId: parentBrand.body.data.id,
        code: 'brand-child',
        displayName: 'Brand Child',
      })
      .expect(201);

    const brandListResponse = await api()
      .get(
        `${BRANDS_BASE_PATH}?organizationId=${firstOrganization.id}&search=brand&isActive=true&page=1&limit=10`,
      )
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    expect(brandListResponse.body.data.meta.total).toBe(2);
    expect(brandListResponse.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: parentBrand.body.data.id }),
        expect.objectContaining({ id: childBrand.body.data.id }),
      ]),
    );

    const selfParentResponse = await api()
      .patch(`${BRANDS_BASE_PATH}/${childBrand.body.data.id}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        parentBrandId: childBrand.body.data.id,
      })
      .expect(400);

    expect(selfParentResponse.body.message).toBe(
      'Parent brand cannot reference the same brand',
    );

    const deleteOrganizationBlocked = await api()
      .delete(`${ORGANIZATIONS_BASE_PATH}/${firstOrganization.id}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(409);

    expect(deleteOrganizationBlocked.body.message).toBe(
      'Organization cannot be deleted while brands are assigned to it',
    );

    await api()
      .delete(`${BRANDS_BASE_PATH}/${childBrand.body.data.id}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    await api()
      .delete(`${BRANDS_BASE_PATH}/${parentBrand.body.data.id}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    await api()
      .delete(`${ORGANIZATIONS_BASE_PATH}/${firstOrganization.id}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);
  });

  it('supports company CRUD for permitted users and rejects invalid or duplicate payloads', async () => {
    const manager = await loginAs(MANAGER_EMAIL, MANAGER_PASSWORD);
    const agent = await loginAs(AGENT_EMAIL, AGENT_PASSWORD);
    const managerProfile = await getProfile(manager.accessToken);

    await api()
      .get(COMPANIES_BASE_PATH)
      .set('Authorization', `Bearer ${agent.accessToken}`)
      .expect(403);

    const createResponse = await api()
      .post(COMPANIES_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        companySymbol: 'AAPL',
        companyName: 'Apple Inc.',
        companyType: 'Public',
        website: 'https://www.apple.com',
        icon: '/storage/local/media/companies/apple.png',
        twitter: '@apple',
        description: 'Consumer electronics and software company.',
        estimatedMarketcap: '3200000000000.00',
      })
      .expect(201);

    expect(createResponse.body.data).toMatchObject({
      companySymbol: 'AAPL',
      companyName: 'Apple Inc.',
      createdByUserId: managerProfile.id,
    });

    const companyId = createResponse.body.data.id;

    await api()
      .post(COMPANIES_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        companySymbol: 'AAPL',
        companyName: 'Apple Again',
      })
      .expect(409);

    const invalidResponse = await api()
      .post(COMPANIES_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        companySymbol: 'TOO-LONG-COMPANY-SYMBOL',
        companyName: 'Invalid Company',
        website: 'not-a-url',
        injected: true,
      })
      .expect(400);

    expect(invalidResponse.body.message).toEqual(
      expect.arrayContaining([
        'companySymbol must be shorter than or equal to 16 characters',
        'website must be a URL address',
        'property injected should not exist',
      ]),
    );

    const listResponse = await api()
      .get(`${COMPANIES_BASE_PATH}?search=apple&companyType=Public`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    expect(listResponse.body.data.meta.total).toBe(1);
    expect(listResponse.body.data.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: companyId })]),
    );

    await api()
      .get(`${COMPANIES_BASE_PATH}/${companyId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    const updateResponse = await api()
      .patch(`${COMPANIES_BASE_PATH}/${companyId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        companyName: 'Apple Incorporated',
        previousCompanySymbol: '',
        description: '',
      })
      .expect(200);

    expect(updateResponse.body.data).toMatchObject({
      companyName: 'Apple Incorporated',
      previousCompanySymbol: null,
      description: null,
    });

    await api()
      .delete(`${COMPANIES_BASE_PATH}/${companyId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    await api()
      .get(`${COMPANIES_BASE_PATH}/${companyId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(404);
  });

  it('supports user CRUD with pagination, search, filters, roles, and brand assignments', async () => {
    const manager = await loginAs(MANAGER_EMAIL, MANAGER_PASSWORD);
    const admin = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);
    const agent = await loginAs(AGENT_EMAIL, AGENT_PASSWORD);
    const managerProfile = await getProfile(manager.accessToken);
    const roles = await listRoles(admin.accessToken);
    const agentRoleId = findRoleIdByCode(roles, 'agent');
    const managerRoleId = findRoleIdByCode(roles, 'manager');

    const organization = await createOrganization(manager.accessToken, {
      code: 'users-org',
      displayName: 'Users Org',
    });

    const brandResponse = await api()
      .post(BRANDS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        organizationId: organization.id,
        code: 'users-brand',
        displayName: 'Users Brand',
      })
      .expect(201);

    await api()
      .get(USERS_BASE_PATH)
      .set('Authorization', `Bearer ${agent.accessToken}`)
      .expect(403);

    const createUserResponse = await api()
      .post(USERS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        email: 'new.user@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'StrongPassword!123',
        roleIds: [agentRoleId],
        brandIds: [brandResponse.body.data.id],
      })
      .expect(201);

    expect(createUserResponse.body.data).toMatchObject({
      email: 'new.user@example.com',
      firstName: 'New',
      lastName: 'User',
      fullName: 'New User',
      roles: ['agent'],
      brandIds: [brandResponse.body.data.id],
      isActive: true,
    });

    const userId = createUserResponse.body.data.id;

    await api()
      .post(USERS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        email: 'new.user@example.com',
        password: 'StrongPassword!123',
      })
      .expect(409);

    const invalidCreateResponse = await api()
      .post(USERS_BASE_PATH)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        email: 'bad-email',
        password: 'weak',
        injected: true,
      })
      .expect(400);

    expect(invalidCreateResponse.body.message).toEqual(
      expect.arrayContaining([
        'email must be an email',
        'password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
        'property injected should not exist',
      ]),
    );

    const userListResponse = await api()
      .get(
        `${USERS_BASE_PATH}?search=new.user&roleCode=agent&isActive=true&page=1&limit=10`,
      )
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    expect(userListResponse.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: userId, email: 'new.user@example.com' }),
      ]),
    );

    const getUserResponse = await api()
      .get(`${USERS_BASE_PATH}/${userId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    expect(getUserResponse.body.data.brandIds).toEqual([
      brandResponse.body.data.id,
    ]);

    const updateUserResponse = await api()
      .patch(`${USERS_BASE_PATH}/${userId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({
        firstName: 'Updated',
        fullName: 'Updated User',
        isActive: false,
        password: 'EvenStrongerPass!456',
        roleIds: [managerRoleId],
        brandIds: [],
      })
      .expect(200);

    expect(updateUserResponse.body.data).toMatchObject({
      firstName: 'Updated',
      fullName: 'Updated User',
      isActive: false,
      roles: ['manager'],
      brandIds: [],
    });

    await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: 'new.user@example.com',
        password: 'EvenStrongerPass!456',
      })
      .expect(403);

    const selfDeleteResponse = await api()
      .delete(`${USERS_BASE_PATH}/${managerProfile.id}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(403);

    expect(selfDeleteResponse.body.message).toBe(
      'You cannot delete your own account',
    );

    await api()
      .delete(`${USERS_BASE_PATH}/${userId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(200);

    await api()
      .get(`${USERS_BASE_PATH}/${userId}`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .expect(404);
  });

  async function prepareDatabase(): Promise<void> {
    await ensureDatabaseExists();
    await resetPublicSchema();
    await setupDataSource.initialize();
    await setupDataSource.runMigrations();
    await syncPermissionsForDatabase(setupDataSource);
    await seedSuperAdminUser(setupDataSource);
    await seedAdminUser(setupDataSource);
    await seedManagerUser(setupDataSource);
    await seedUserWithRole(setupDataSource, AGENT_SEED_CONFIG);
    await setupDataSource.destroy();
  }

  async function resetState(): Promise<void> {
    await dataSource.query(
      'TRUNCATE TABLE "user_brands", "brands", "organizations", "companies", "auth_action_tokens", "user_sessions", "audit_log", "user_role_assignments", "users" RESTART IDENTITY CASCADE',
    );
    await seedSuperAdminUser(dataSource);
    await seedAdminUser(dataSource);
    await seedManagerUser(dataSource);
    await seedUserWithRole(dataSource, AGENT_SEED_CONFIG);
  }

  async function resetPublicSchema(): Promise<void> {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      await client.query('DROP SCHEMA IF EXISTS public CASCADE');
      await client.query('CREATE SCHEMA public');
    } finally {
      await client.end();
    }
  }

  function api() {
    return request(app.getHttpServer());
  }

  async function loginAs(
    email: string,
    password: string,
  ): Promise<LoginResult> {
    const response = await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({ email, password })
      .expect(201);

    return response.body.data;
  }

  async function createOrganization(
    accessToken: string,
    payload: Record<string, unknown>,
  ) {
    const response = await api()
      .post(ORGANIZATIONS_BASE_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201);

    return response.body.data;
  }

  async function getProfile(accessToken: string) {
    const response = await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    return response.body.data;
  }

  async function listRoles(accessToken: string): Promise<RoleSummary[]> {
    const response = await api()
      .get(ROLES_BASE_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    return response.body.data;
  }

  function findRoleIdByCode(roles: RoleSummary[], code: string): string {
    const role = roles.find((item) => item.code === code);
    if (!role) {
      throw new Error(`Role "${code}" not found in seeded test data`);
    }

    return role.id;
  }
});
