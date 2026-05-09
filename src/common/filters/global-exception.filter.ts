import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppLoggerService } from '../../core/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    this.logger.error(
      exception instanceof Error
        ? `${request.method} ${request.url} - ${exception.stack ?? exception.message}`
        : `${request.method} ${request.url} - ${String(exception)}`,
      'GlobalExceptionFilter',
    );

    response.status(status).json({
      success: false,
      message:
        typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse
          ? (errorResponse as { message?: string | string[] }).message
          : exception instanceof Error
            ? exception.message
            : 'Internal server error',
      errors:
        typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse
          ? (errorResponse as { message?: unknown }).message
          : [],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
