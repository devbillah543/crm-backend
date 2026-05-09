import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response-transform.interceptor';
import { HealthController } from '../src/modules/health/health.controller';
import { HealthService } from '../src/modules/health/health.service';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              success: true,
              message: 'Server is ready',
              data: {
                app: 'ok',
                database: 'ok',
                redis: 'ok',
              },
            }),
            checkLiveness: jest.fn().mockResolvedValue({
              success: true,
              message: 'Server is alive',
              data: {
                app: 'ok',
              },
            }),
            checkReadiness: jest.fn().mockResolvedValue({
              success: true,
              message: 'Server is ready',
              data: {
                app: 'ok',
                database: 'ok',
                redis: 'ok',
              },
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: true,
          message: 'Server is ready',
          data: {
            app: 'ok',
            database: 'ok',
            redis: 'ok',
          },
        });
      });
  });

  it('/health/live (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: true,
          message: 'Server is alive',
          data: {
            app: 'ok',
          },
        });
      });
  });

  it('/health/ready (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: true,
          message: 'Server is ready',
          data: {
            app: 'ok',
            database: 'ok',
            redis: 'ok',
          },
        });
      });
  });
});
