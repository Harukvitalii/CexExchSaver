import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';
import fs from 'fs';
import { reactService } from './react.service';
import { graphRecord } from './react.interface';

@Controller('graph')
export class graphController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cexApi: SaverService,
    private readonly reactHelepr: reactService,
  ) {}

  @Get(':startData/:endData/:step')
  async startGraph(
    @Param('startData') startData: string,
    @Param('endData') endData: string,
    @Param('step') step: string,
  ) {
    console.log(startData, endData);
    // const records: priceRecord[] = await this.db.loadRecords();
    const records: priceRecord[] = await this.db.loadRecordsBetweenData(
      new Date(startData),
      new Date(endData),
    );
    const stepNumber: number = this.reactHelepr.convertIntervalToStep(step);
    const GraphRecords: graphRecord[] = this.reactHelepr.filterRecordsGraph(
      records,
      stepNumber,
      'EUR/USDT',
    );
    return GraphRecords;
    // async getPriceExchangeInfo() {
    //   console.log(new Date());
    //   const prices = await this.redis.get('exchnage-prices');
    //   try {
    //     console.log('prices Exchanges', JSON.parse(prices));
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }

    //   @OnEvent('start_checking_saving')
    //   async startComparesion() {
    //     console.log('doing comparison');
    //     const pairsString = this.configService.get('ALLOWED_PAIRS');
    //     const pairs: string[] = JSON.parse(pairsString);
    //     console.log(pairs);

    //     while (true) {
    //       const prices = JSON.parse(await this.redis.get('exchnage-prices'));
    //       for (const pair of pairs) {
    //         const [base, quaote] = pair.split('/');
    //         // check for undefined pairs in exchnages
    //         const filterUndefined = Object.entries(prices).filter(
    //           ([exchange, exchangePrices]) =>
    //             exchangePrices &&
    //             exchangePrices[base] &&
    //             exchangePrices[base][quaote],
    //         );
    //         // save as lists of [exchange, price]
    //         const listExchPrice = filterUndefined.map(
    //           ([exchange, exchangePrices]) => [
    //             exchange,
    //             exchangePrices[base][quaote],
    //           ],
    //         );
    //         // sort exchange using sort by price
    //         const sortedList = listExchPrice.sort((a, b) => a[1] - b[1]);

    //         this.minPriceExchange[pair] = sortedList[0] as [string, number];
    //       }
    //       await new Promise((resolve) => setTimeout(resolve, 1500));
    //     }
    //     // const pricesInfo = await this.redis.get('exchnage-prices');
    //   }
    //   @Interval(5000)
    //   async getminPriceExchangeInfo() {
    //     try {
    //       console.log(new Date(), 'result: ', this.minPriceExchange);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   }
  }
}
