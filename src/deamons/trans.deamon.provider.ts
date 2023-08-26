import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/services/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';
import fs from 'fs';

@Injectable()
export class BackgroundService {
  minPriceExchange: Record<string, [string, number]> = {};

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly cctxBulk: SaverService,
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {}
  async onApplicationBootstrap() {
    console.log('start events');
    this.startWS();
  }

  async startWS() {
    while (true) {
      try {
        const exchanges = await this.cctxBulk.getExchanges();
        const pairsToLoop: string[] = JSON.parse(
          this.configService.get('ALLOWED_EXCHANGES'),
        );

        const pairs = [pairsToLoop.map((exchange) => exchanges[exchange])];
        await Promise.all(
          pairs.map(async (cexExchanges: ccxt.Exchange[]) => {
            try {
              console.log(`Starting startCheckingPairs `);
              await this.cctxBulk.startCheckingPairs(cexExchanges);
            } catch (error) {
              console.error(`Error creating loop`, error);
              console.log('Available exchanges:', ccxt.exchanges);
              throw error;
            }
          }),
        );
      } catch (e) {
        console.log('error when init exchanges');
        this.cctxBulk.sleep(5);
      }
    }
  }
}
