import { Injectable, LoggerService, OnModuleDestroy } from '@nestjs/common';
import pino, { type Logger } from 'pino';
import pretty from 'pino-pretty';
import { createWriteStream, mkdirSync, type WriteStream } from 'fs';
import { join } from 'path';

type LogFileMode = 'single' | 'daily';

class RotatingLogFileStream {
  private currentDate = '';
  private currentStream?: WriteStream;

  constructor(
    private readonly logsDir: string,
    private readonly mode: LogFileMode,
  ) {}

  write(message: string): void {
    this.getStream().write(message);
  }

  close(): void {
    this.currentStream?.end();
    this.currentStream = undefined;
  }

  private getStream(): WriteStream {
    const nextDate = this.formatDate(new Date());

    if (!this.currentStream || (this.mode === 'daily' && this.currentDate !== nextDate)) {
      this.currentStream?.end();
      this.currentDate = nextDate;
      this.currentStream = createWriteStream(this.resolveFilename(nextDate), { flags: 'a' });
    }

    return this.currentStream;
  }

  private resolveFilename(date: string): string {
    return this.mode === 'daily'
      ? join(this.logsDir, `app-${date}.log`)
      : join(this.logsDir, 'app.log');
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

@Injectable()
export class AppLoggerService implements LoggerService, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly fileStream: RotatingLogFileStream;

  constructor() {
    const logsDir = join(process.cwd(), 'storage', 'logs');
    const logFileMode = this.resolveLogFileMode(process.env.LOG_FILE_MODE);

    mkdirSync(logsDir, { recursive: true });
    this.fileStream = new RotatingLogFileStream(logsDir, logFileMode);

    const streams = [
      { stream: this.fileStream },
      ...(process.env.NODE_ENV === 'production'
        ? []
        : [
            {
              stream: pretty({
                colorize: true,
                translateTime: 'SYS:standard',
              }),
            },
          ]),
    ];

    this.logger = pino(
      {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
      pino.multistream(streams),
    );
  }

  log(message: string, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: string, context?: string): void {
    this.logger.error({ context }, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ context }, message);
  }

  onModuleDestroy(): void {
    this.fileStream.close();
  }

  private resolveLogFileMode(value: string | undefined): LogFileMode {
    return value?.toLowerCase() === 'daily' ? 'daily' : 'single';
  }
}
