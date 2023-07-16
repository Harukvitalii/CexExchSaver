import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExchangeService } from 'src/cex/exchnage.service';
import { DatabaseService } from 'src/database/database.service';
import { LoggingService } from 'src/logger/logging.service';

@Injectable()
export class BackgroundService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggingService,
    private readonly exchangeService: ExchangeService,
  ) {}
  @Cron('0 */15 * * * *')
  //   @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    console.log('working');
    // await this.exchangeService.loadWS();
  }
}
