import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns liveness payload', async () => {
    const service = new HealthService({} as never, {} as never);

    await expect(service.checkLiveness()).resolves.toEqual({
      success: true,
      message: 'Server is alive',
      data: {
        app: 'ok',
      },
    });
  });

  it('checks database and redis and returns readiness payload', async () => {
    const databaseHealthService = {
      check: jest.fn().mockResolvedValue(true),
    };
    const redisService = {
      isUsingFallback: jest.fn().mockReturnValue(false),
      ping: jest.fn().mockResolvedValue('PONG'),
    };

    const service = new HealthService(
      databaseHealthService as never,
      redisService as never,
    );

    await expect(service.checkReadiness()).resolves.toEqual({
      success: true,
      message: 'Server is ready',
      data: {
        app: 'ok',
        database: 'ok',
        redis: 'ok',
      },
    });
  });

  it('throws service unavailable when redis is down', async () => {
    const databaseHealthService = {
      check: jest.fn().mockResolvedValue(true),
    };
    const redisService = {
      isUsingFallback: jest.fn().mockReturnValue(false),
      ping: jest.fn().mockRejectedValue(new Error('redis down')),
    };

    const service = new HealthService(
      databaseHealthService as never,
      redisService as never,
    );

    await expect(service.checkReadiness()).rejects.toMatchObject({
      status: 503,
      response: {
        success: false,
        message: 'Server dependencies are unavailable',
        data: {
          app: 'ok',
          database: 'ok',
          redis: 'error',
        },
      },
    });
  });

  it('returns readiness payload when redis fallback mode is active', async () => {
    const databaseHealthService = {
      check: jest.fn().mockResolvedValue(true),
    };
    const redisService = {
      isUsingFallback: jest.fn().mockReturnValue(true),
      ping: jest.fn(),
    };

    const service = new HealthService(
      databaseHealthService as never,
      redisService as never,
    );

    await expect(service.checkReadiness()).resolves.toEqual({
      success: true,
      message: 'Server is ready',
      data: {
        app: 'ok',
        database: 'ok',
        redis: 'fallback',
      },
    });
  });
});
