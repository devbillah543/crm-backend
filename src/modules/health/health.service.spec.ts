import { HealthService } from './health.service';

describe('HealthService', () => {
  it('checks database and redis in parallel and returns healthy payload', async () => {
    const databaseHealthService = {
      check: jest.fn().mockResolvedValue(true),
    };
    const redisService = {
      getClient: jest.fn().mockReturnValue({
        ping: jest.fn().mockResolvedValue('PONG'),
      }),
    };

    const service = new HealthService(
      databaseHealthService as never,
      redisService as never,
    );

    await expect(service.check()).resolves.toEqual({
      success: true,
      message: 'Server is running',
      data: {
        app: 'ok',
        database: 'ok',
        redis: 'ok',
      },
    });
  });
});
