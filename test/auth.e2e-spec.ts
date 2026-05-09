process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://root:secure_password@localhost:5432/sidago_test';
process.env.STORAGE_LOCAL_ROOT = process.env.STORAGE_LOCAL_ROOT ?? 'storage/test-local';

import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';

require('reflect-metadata');

const request = require('supertest');
const { Client } = require('pg');
const { Global, Module, ValidationPipe, VersioningType } = require('@nestjs/common');
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
const { AuthModule } = require('../src/modules/auth/auth.module');
const { MediaModule } = require('../src/modules/media/media.module');
const { ResponseTransformInterceptor } = require('../src/common/interceptors/response-transform.interceptor');
const { GlobalExceptionFilter } = require('../src/common/filters/global-exception.filter');
const { ensureDatabaseExists } = require('../src/core/database/ensure-database');
const setupDataSource = require('../src/core/database/database.datasource').default;
const { seedPermissions } = require('../src/database/seeders/permission.seeder');
const { seedSuperAdminUser } = require('../src/database/seeders/super-admin-user.seeder');
const { seedAdminUser } = require('../src/database/seeders/admin-user.seeder');
const { seedManagerUser } = require('../src/database/seeders/manager-user.seeder');
const { seedAgentUser } = require('../src/database/seeders/agent-user.seeder');

const AUTH_BASE_PATH = '/api/v1/auth';
const MEDIA_BASE_PATH = '/api/v1/media';
const SUPER_ADMIN_EMAIL = 'superadmin@example.com';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';

type MailPayload = {
  to: string;
  subject: string;
  html: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

const mailJobs: MailPayload[] = [];
const redisCache = new Map<string, string>();
const storageFiles = new Map<string, Buffer>();
const deletedStorageKeys: string[] = [];

const queueServiceMock = {
  enqueueMail: jest.fn(async (payload: MailPayload) => {
    mailJobs.push(payload);
  }),
  enqueueNotification: jest.fn(async () => undefined),
  enqueueAnalytics: jest.fn(async () => undefined),
};

const TEST_STORAGE_BASE_URL = '/storage/test-local';

const redisServiceMock = {
  get: jest.fn(async (key: string) => redisCache.get(key) ?? null),
  set: jest.fn(async (key: string, value: string) => {
    redisCache.set(key, value);
  }),
  del: jest.fn(async (key: string) => {
    redisCache.delete(key);
  }),
  getClient: jest.fn(),
  onModuleDestroy: jest.fn(async () => undefined),
};

const websocketServiceMock = {
  emitToUser: jest.fn(),
  emitToRole: jest.fn(),
};

const storageServiceMock = {
  activeDriver: 'local',
  putBuffer: jest.fn(async (key: string, body: Buffer, options?: { contentType?: string }) => {
    storageFiles.set(key, body);
    return {
      key,
      size: body.length,
      contentType: options?.contentType,
      url: `${TEST_STORAGE_BASE_URL}/${key}`,
    };
  }),
  delete: jest.fn(async (key: string) => {
    storageFiles.delete(key);
    deletedStorageKeys.push(key);
  }),
  exists: jest.fn(async (key: string) => storageFiles.has(key)),
  read: jest.fn(async (key: string) => storageFiles.get(key) ?? Buffer.alloc(0)),
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
  exports: [QueueService, RedisService, StorageService, WebsocketService, AppLoggerService],
})
class MockInfrastructureModule {}

describe('AuthController (e2e)', () => {
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
        MediaModule,
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
    await resetAuthState();
    mailJobs.length = 0;
    redisCache.clear();
    storageFiles.clear();
    deletedStorageKeys.length = 0;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('logs in successfully and returns only tokens', async () => {
    const response = await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .set('user-agent', desktopChromeUserAgent())
      .set('x-forwarded-for', '203.0.113.10')
      .set('x-vercel-ip-city', 'Dhaka')
      .set('x-vercel-ip-country', 'BD')
      .send({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(response.body.data.user).toBeUndefined();

    const sessions = await dataSource.query(
      'select device_name, browser, os, ip_address, location from "user_sessions"',
    );
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      device_name: 'Desktop Device',
      browser: 'Chrome',
      os: 'Windows',
      ip_address: '203.0.113.10',
      location: 'Dhaka, BD',
    });
  });

  it('rejects unknown login fields such as deviceName', async () => {
    const response = await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        deviceName: 'Injected Device',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('property deviceName should not exist');
  });

  it('returns the same invalid credentials response for missing users and wrong passwords', async () => {
    const wrongPasswordResponse = await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: SUPER_ADMIN_EMAIL,
        password: 'WrongPassword!123',
      })
      .expect(401);

    const missingUserResponse = await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: 'missing@example.com',
        password: 'WrongPassword!123',
      })
      .expect(401);

    expect(wrongPasswordResponse.body.message).toBe('Invalid credentials');
    expect(missingUserResponse.body.message).toBe('Invalid credentials');
  });

  it('locks the account after repeated failed login attempts', async () => {
    for (let index = 0; index < 5; index += 1) {
      await api()
        .post(`${AUTH_BASE_PATH}/login`)
        .send({
          email: ADMIN_EMAIL,
          password: 'WrongPassword!123',
        })
        .expect(401);
    }

    const lockedResponse = await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })
      .expect(401);

    expect(lockedResponse.body.message).toBe('Account is temporarily locked');
  });

  it('rotates refresh tokens and revokes all sessions on refresh token reuse', async () => {
    const login = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);

    const refresh = await api()
      .post(`${AUTH_BASE_PATH}/refresh`)
      .set('user-agent', desktopChromeUserAgent())
      .send({ refreshToken: login.refreshToken })
      .expect(200);

    expect(refresh.body.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    const reuse = await api()
      .post(`${AUTH_BASE_PATH}/refresh`)
      .set('user-agent', desktopChromeUserAgent())
      .send({ refreshToken: login.refreshToken })
      .expect(401);

    expect(reuse.body.message).toBe('Refresh token reuse detected');

    await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${refresh.body.data.accessToken}`)
      .expect(401);

    expect(mailJobs).toHaveLength(1);
    expect(mailJobs[0].subject.toLowerCase()).toContain('security');
  });

  it('returns the current profile and lists active sessions with pagination metadata', async () => {
    const firstLogin = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, {
      'user-agent': desktopChromeUserAgent(),
      'x-forwarded-for': '198.51.100.11',
    });
    await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, {
      'user-agent': mobileSafariUserAgent(),
      'x-forwarded-for': '198.51.100.12',
    });

    const meResponse = await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${firstLogin.accessToken}`)
      .expect(200);

    expect(meResponse.body.data).toMatchObject({
      email: SUPER_ADMIN_EMAIL,
      roles: expect.arrayContaining(['super_admin']),
      permissions: expect.any(Array),
    });

    const sessionsResponse = await api()
      .get(`${AUTH_BASE_PATH}/sessions?page=1&limit=10`)
      .set('Authorization', `Bearer ${firstLogin.accessToken}`)
      .expect(200);

    expect(sessionsResponse.body.data.meta).toEqual({
      page: 1,
      limit: 10,
      total: 2,
    });
    expect(sessionsResponse.body.data.items).toHaveLength(2);
    expect(sessionsResponse.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deviceName: 'Desktop Device',
          isCurrent: true,
        }),
        expect.objectContaining({
          deviceName: 'Mobile Device',
          browser: 'Safari',
          os: 'iOS',
        }),
      ]),
    );
  });

  it('logs out the current session and blocks the token afterward', async () => {
    const login = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);

    await api()
      .post(`${AUTH_BASE_PATH}/logout`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200);

    await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(401);
  });

  it('revokes a specific session and invalidates that device only', async () => {
    const current = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, {
      'user-agent': desktopChromeUserAgent(),
    });
    const other = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, {
      'user-agent': mobileSafariUserAgent(),
    });

    const sessions = await api()
      .get(`${AUTH_BASE_PATH}/sessions`)
      .set('Authorization', `Bearer ${current.accessToken}`)
      .expect(200);

    const otherSession = sessions.body.data.items.find(
      (item: { isCurrent: boolean }) => !item.isCurrent,
    );

    await api()
      .delete(`${AUTH_BASE_PATH}/sessions/${otherSession.id}`)
      .set('Authorization', `Bearer ${current.accessToken}`)
      .expect(200);

    await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .expect(401);

    await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${current.accessToken}`)
      .expect(200);
  });

  it('logs out all sessions for the account', async () => {
    const first = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    const second = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, {
      'user-agent': mobileSafariUserAgent(),
    });

    await api()
      .post(`${AUTH_BASE_PATH}/logout-all`)
      .set('Authorization', `Bearer ${first.accessToken}`)
      .expect(200);

    await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${first.accessToken}`)
      .expect(401);

    await api()
      .get(`${AUTH_BASE_PATH}/me`)
      .set('Authorization', `Bearer ${second.accessToken}`)
      .expect(401);

    const counts = await dataSource.query(
      'select count(*)::int as total from "user_sessions" where "revoked_at" is null',
    );
    expect(counts[0].total).toBe(0);
  });

  it('resends a verification email and consumes the token exactly once', async () => {
    await dataSource.query(
      'update "users" set "email_verified_at" = null, "verification_email_sent_at" = null where "email" = $1',
      [ADMIN_EMAIL],
    );

    const login = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);

    const resend = await api()
      .post(`${AUTH_BASE_PATH}/resend-verification-email`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200);

    expect(resend.body.message).toBe('Verification email queued successfully');
    expect(mailJobs).toHaveLength(1);

    const token = extractTokenFromHtml(mailJobs[0].html);
    await api()
      .post(`${AUTH_BASE_PATH}/verify-email`)
      .send({ token })
      .expect(200);

    const users = await dataSource.query(
      'select "email_verified_at" from "users" where "email" = $1',
      [ADMIN_EMAIL],
    );
    expect(users[0].email_verified_at).not.toBeNull();

    const reused = await api()
      .post(`${AUTH_BASE_PATH}/verify-email`)
      .send({ token })
      .expect(401);

    expect(reused.body.message).toBe('Token is invalid or expired');
  });

  it('keeps forgot-password responses generic and resets the password with a valid token', async () => {
    const missing = await api()
      .post(`${AUTH_BASE_PATH}/forgot-password`)
      .send({ email: 'nobody@example.com' })
      .expect(200);

    expect(missing.body.message).toBe(
      'If the email exists in our system, a password reset message has been queued.',
    );
    expect(mailJobs).toHaveLength(0);

    const forgot = await api()
      .post(`${AUTH_BASE_PATH}/forgot-password`)
      .send({ email: ADMIN_EMAIL })
      .expect(200);

    expect(forgot.body.message).toBe(
      'If the email exists in our system, a password reset message has been queued.',
    );
    expect(mailJobs).toHaveLength(1);

    const token = extractTokenFromHtml(mailJobs[0].html);
    await api()
      .post(`${AUTH_BASE_PATH}/reset-password`)
      .send({
        token,
        newPassword: 'ResetPassword!456',
      })
      .expect(200);

    await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })
      .expect(401);

    await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: ADMIN_EMAIL,
        password: 'ResetPassword!456',
      })
      .expect(201);

    await api()
      .post(`${AUTH_BASE_PATH}/reset-password`)
      .send({
        token,
        newPassword: 'AnotherPassword!789',
      })
      .expect(401);
  });

  it('validates profile password changes and blocks conflicting emails', async () => {
    const login = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);

    const missingCurrentPassword = await api()
      .patch(`${AUTH_BASE_PATH}/profile`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .send({ newPassword: 'AnotherStrongPass!123' })
      .expect(400);

    expect(missingCurrentPassword.body.message).toBe(
      'Current password is required when changing password',
    );

    const conflict = await api()
      .patch(`${AUTH_BASE_PATH}/profile`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .send({ email: ADMIN_EMAIL })
      .expect(409);

    expect(conflict.body.message).toBe('Email is already in use');
  });

  it('uploads media and uses the returned avatar string in the profile api', async () => {
    const login = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    const imageBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

    const upload = await api()
      .post(`${MEDIA_BASE_PATH}/upload`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .field('folder', 'avatars')
      .attach('file', imageBuffer, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(upload.body.data).toMatchObject({
      key: expect.stringContaining('media/users/'),
      url: expect.stringContaining('/storage/test-local/media/users/'),
      size: imageBuffer.length,
      contentType: 'image/png',
    });

    const response = await api()
      .patch(`${AUTH_BASE_PATH}/profile`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .send({
        firstName: 'Root',
        lastName: 'Owner',
        email: 'root.owner@example.com',
        currentPassword: SUPER_ADMIN_PASSWORD,
        newPassword: 'EvenStrongerPass!456',
        avatar: upload.body.data.url,
      })
      .expect(200);

    expect(response.body.data).toMatchObject({
      email: 'root.owner@example.com',
      firstName: 'Root',
      lastName: 'Owner',
      fullName: 'Root Owner',
      emailVerifiedAt: null,
      avatarUrl: upload.body.data.url,
    });
    expect(mailJobs).toHaveLength(1);
    expect(storageFiles.size).toBe(1);

    await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
      })
      .expect(401);

    await api()
      .post(`${AUTH_BASE_PATH}/login`)
      .send({
        email: 'root.owner@example.com',
        password: 'EvenStrongerPass!456',
      })
      .expect(201);
  });

  it('rejects non-image media uploads', async () => {
    const login = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);

    const response = await api()
      .post(`${MEDIA_BASE_PATH}/upload`)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .attach('file', Buffer.from('plain-text-file'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      })
      .expect(400);

    expect(response.body.message).toBe('File must be an image');
  });

  it('rejects avatar strings that do not belong to the current user', async () => {
    const owner = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    const otherUser = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);
    const imageBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

    const upload = await api()
      .post(`${MEDIA_BASE_PATH}/upload`)
      .set('Authorization', `Bearer ${otherUser.accessToken}`)
      .field('folder', 'avatars')
      .attach('file', imageBuffer, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201);

    const response = await api()
      .patch(`${AUTH_BASE_PATH}/profile`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        avatar: upload.body.data.url,
      })
      .expect(400);

    expect(response.body.message).toBe(
      'Avatar must reference a file uploaded by the current user',
    );
  });

  async function prepareDatabase(): Promise<void> {
    await ensureDatabaseExists();
    await resetPublicSchema();
    await setupDataSource.initialize();
    await setupDataSource.runMigrations();
    await seedPermissions(setupDataSource);
    await seedSuperAdminUser(setupDataSource);
    await seedAdminUser(setupDataSource);
    await seedManagerUser(setupDataSource);
    await seedAgentUser(setupDataSource);
    await setupDataSource.destroy();
  }

  async function resetAuthState(): Promise<void> {
    await dataSource.query(
      'TRUNCATE TABLE "auth_action_tokens", "user_sessions", "audit_log", "user_role_assignments", "users" RESTART IDENTITY CASCADE',
    );
    await seedSuperAdminUser(dataSource);
    await seedAdminUser(dataSource);
    await seedManagerUser(dataSource);
    await seedAgentUser(dataSource);
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
    headers: Record<string, string> = {},
  ): Promise<LoginResult> {
    let req = api().post(`${AUTH_BASE_PATH}/login`);
    for (const [name, value] of Object.entries(headers)) {
      req = req.set(name, value);
    }

    const response = await req.send({ email, password }).expect(201);
    return response.body.data;
  }

  function extractTokenFromHtml(html: string): string {
    const match = html.match(/token=([a-f0-9]+)/i);
    if (!match?.[1]) {
      throw new Error(`Could not extract token from mail HTML: ${html}`);
    }

    return match[1];
  }

  function desktopChromeUserAgent(): string {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
  }

  function mobileSafariUserAgent(): string {
    return 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
  }
});
