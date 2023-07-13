import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggingService {
  private logger: winston.Logger;

  constructor() {
    const transport = new DailyRotateFile({
      filename: './logs/BackTrustee-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    });

    this.logger = winston.createLogger({
      transports: [transport],
    });
  }

  log(message: string) {
    this.logger.log('info', message);
  }

  error(message: string) {
    this.logger.log('error', message);
  }
}
