import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Readiness check',
    description:
      'Verifies that the server is ready to serve traffic and confirms connectivity to the configured database and Redis instances.',
  })
  @ApiOkResponse({
    description: 'Server, database, and Redis are all healthy.',
    schema: {
      example: {
        success: true,
        message: 'Server is ready',
        data: {
          app: 'ok',
          database: 'ok',
          redis: 'ok',
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'One or more critical dependencies are unavailable.',
  })
  async check(): Promise<Record<string, unknown>> {
    return this.healthService.check();
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Verifies that the application process is alive.',
  })
  @ApiOkResponse({
    description: 'Application process is alive.',
    schema: {
      example: {
        success: true,
        message: 'Server is alive',
        data: {
          app: 'ok',
        },
      },
    },
  })
  async live(): Promise<Record<string, unknown>> {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Explicit readiness check',
    description:
      'Verifies that the server is ready to serve traffic and confirms connectivity to the configured database and Redis instances.',
  })
  @ApiOkResponse({
    description: 'Server is ready.',
  })
  @ApiServiceUnavailableResponse({
    description: 'One or more critical dependencies are unavailable.',
  })
  async ready(): Promise<Record<string, unknown>> {
    return this.healthService.checkReadiness();
  }
}
