import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Verifies that the server is running and confirms connectivity to the configured database and Redis instances.',
  })
  @ApiOkResponse({
    description: 'Server, database, and Redis are all healthy.',
    schema: {
      example: {
        success: true,
        message: 'Server is running',
        data: {
          app: 'ok',
          database: 'ok',
          redis: 'ok',
        },
      },
    },
  })
  async check(): Promise<Record<string, unknown>> {
    return this.healthService.check();
  }
}
