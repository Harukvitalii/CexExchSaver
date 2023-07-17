import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { RedisCacheService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackgroundService {
  minPriceExchange: Record<string, [string, number]> = {};

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly cctxBulk: SaverService,
    private readonly redis: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}
  async onApplicationBootstrap() {
    console.log('start events');
    this.eventEmitter.emit('start_exchange_motinoring');
    this.eventEmitter.emit('start_checking_saving');
  }

  @OnEvent('start_exchange_motinoring')
  async startWS() {
    const exchanges = await this.cctxBulk.getExchanges();
    await Promise.all(
      Object.values(exchanges).map(async (cex: ccxt.Exchange) => {
        try {
          console.log(`Starting WebSocket listener for ${cex.id}`);
          await this.cctxBulk.startOrderBookListener(cex);
        } catch (error) {
          console.error(`Error creating exchange ${cex.id}:`, error);
          console.log('Available exchanges:', ccxt.exchanges);
          throw error;
        }
      }),
    );
  }

  @Interval(3000)
  async getPriceExchangeInfo() {
    console.log(new Date());
    const prices = await this.redis.get('exchnage-prices');
    try {
      console.log('prices whitebit', JSON.parse(prices));
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('start_checking_saving')
  async startComparesion() {
    console.log('doing comparison');
    const pairsString = this.configService.get('ALLOWED_PAIRS');
    const pairs: string[] = JSON.parse(pairsString);
    console.log(pairs);

    while (true) {
      const prices = JSON.parse(await this.redis.get('exchnage-prices'));
      for (const pair of pairs) {
        const [base, quaote] = pair.split('/');
        // check for undefined pairs in exchnages
        const filterUndefined = Object.entries(prices).filter(
          ([exchange, exchangePrices]) =>
            exchangePrices &&
            exchangePrices[base] &&
            exchangePrices[base][quaote],
        );
        // save as lists of [exchange, price]
        const listExchPrice = filterUndefined.map(
          ([exchange, exchangePrices]) => [
            exchange,
            exchangePrices[base][quaote],
          ],
        );
        // sort exchange using sort by price
        const sortedList = listExchPrice.sort((a, b) => a[1] - b[1]);

        this.minPriceExchange[pair] = sortedList[0] as [string, number];
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    // const pricesInfo = await this.redis.get('exchnage-prices');
  }
  @Interval(5000)
  async getminPriceExchangeInfo() {
    try {
      console.log(new Date(), 'result: ', this.minPriceExchange);
    } catch (e) {
      console.log(e);
    }
  }
}
