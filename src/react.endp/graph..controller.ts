import { Controller, Get, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';
import fs from 'fs';

@Controller('graph')
export class graphController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async startGraph(): Promise<any[]> {
    const records: priceRecord[] = await this.db.loadRecords();
    const filteredRecords = records.filter(
      (rec) => rec.dataValues.symbol === 'EUR/USDT',
    );
    const recordsByGroup = new Map<string, priceRecord[]>();
    for (const rec of filteredRecords.slice(0, 3333)) {
      const groupHash = rec.dataValues.groupHash;
      if (recordsByGroup.has(groupHash)) {
        recordsByGroup.get(groupHash).push(rec);
      } else {
        recordsByGroup.set(groupHash, [rec]);
      }
    }
    // console.log(recordsByGroup);
    const GroupGraphData = [];
    for (const recs of recordsByGroup.values()) {
      const result = recs.map((priceRecord) => ({
        exchange: priceRecord.dataValues.exchange,
        addedAt: new Date(parseInt(priceRecord.dataValues.timeAdded, 10)),
        price: priceRecord.dataValues.price,
      }));
      GroupGraphData.push(result);
    }
    return GroupGraphData;
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
