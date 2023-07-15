import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { LoggingService } from 'src/logger/logging.service';

@Injectable()
export class BackgroundService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggingService,
    private readonly exchangeService: 
  ) {}
  @Cron('0 */5 * * * *')
  //   @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    console.log('working deamon ');
  }
}
