/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import * as ccxt from 'ccxt';
import { ExchangeFees, pairToSubDict } from './cex.interface';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';

//config service

interface cexPairs {
  [name: string]: Record<string, Record<string, number>>; 
}


@Injectable()
export class SaverService {
  pairs: string[]
  exchanges: string[]
  cex_pairs: cexPairs
  exchangeFees: ExchangeFees
  
  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
    ) {
    this.exchanges    = JSON.parse(this.configService.get("ALLOWED_EXCHANGES"))
    this.pairs        = JSON.parse(this.configService.get("ALLOWED_PAIRS"))
    this.exchangeFees = JSON.parse(this.configService.get("EXCHANGE_FEES"))
    this.cex_pairs = {}
  }

  async getExchanges(): Promise<{ [name: string]: ccxt.Exchange }> {
    console.log('markets: ', this.exchanges)
    const exchangeInst: { [name: string]: ccxt.Exchange} = {};
    await Promise.all(
      this.exchanges.map(async (id: string) => {
        try {
          const CCXT = ccxt as any;
          const cex: ccxt.Exchange = new CCXT[id]({
            enableRateLimit: true,
        })
         
        await cex.loadMarkets();
        console.log(`loaded markets ${cex.id}`)
        exchangeInst[id] = cex
      } catch (error) {
          console.log(`Error creating exchange ${id}:`, error);
          throw error;
      }
  }));
    return exchangeInst;
  }


  async startChekingPairs(exchanges: ccxt.Exchange[]) { 
    // check and save if pairs is reverse
    try { 
      const pairsToSubscribeExs: pairToSubDict = {}
      const REVERSED_PAIRS = this.pairs.map(pair => {
        const [base, quote] = pair.split('/');
        return `${quote}/${base}`;
      });
      for (const exchange of exchanges) { 
        for (const symbol of exchange.symbols) { 
          
          if (this.pairs.includes(symbol)) {
            pairsToSubscribeExs[symbol] ??= {};
            pairsToSubscribeExs[symbol][exchange.id] = {"reverse": false}
          }
          else if (REVERSED_PAIRS.includes(symbol)) { 
            const [base, quaote] = symbol.split('/')
            pairsToSubscribeExs[`${quaote}/${base}`] ??= {};
            pairsToSubscribeExs[`${quaote}/${base}`][exchange.id] = {"reverse": true}
          }
        }
      }
      console.log(pairsToSubscribeExs)

      // const pairsToSub = this.getMatchingPairs(pairsToSubscribeExs)
      // const pairsToSub = this.pairs;
      // loop one pair printing difference on exchanges
      await Promise.all(this.pairs.map(pair => this.startSymoblLoop(exchanges, pair, pairsToSubscribeExs)))
    } catch (e) { 
      console.log('error startChekingPairs', e)
    }
  }

  getMatchingPairs(lists: string[][]): string[] {
    // Create a Set from the first list for faster lookups
    const set1 = new Set(lists[0]);
    
    const matchingPairs = lists.slice(1).reduce((accumulator, currentList) => {
      const filteredArray = Array.from(accumulator).filter(pair => currentList.includes(pair));
      return new Set(filteredArray);
    }, set1);
    
    return Array.from(matchingPairs);
  }
  
  
      
  
  async startSymoblLoop(exchanges: ccxt.Exchange[], pair: string, pairsToSub: pairToSubDict) { 
      console.log(`Starting loop ${pair}`)
      while (true) { 
        try { 
          const [base, quaote] = pair.split('/')
          //create pormises for orderbook load
          const orderBookPromises = exchanges.map(exchange => {
            if (pairsToSub[pair][exchange.id].reverse) {
              return exchange.fetchOrderBook(`${quaote}/${base}`)
            }
            else { 
              return exchange.fetchOrderBook(pair)
              }
            }
          );
          //resolve
          const orderbooksPromise: Promise<ccxt.OrderBook[]> = Promise.all(orderBookPromises)
          const orderbooks = await orderbooksPromise
          const orderBookresults = [];

          // Loop through each exchange and calculate the bid and ask prices
          exchanges.forEach((exchange, index) => {
            let bid: number;
            let ask: number;
            if (pairsToSub[pair][exchange.id].reverse)  {
              bid = 1 / (orderbooks[index]['bids'][0][0] * (1 - this.exchangeFees[exchange.id].buy / 100));
              ask = 1 / (orderbooks[index]['asks'][0][0] * (1 - this.exchangeFees[exchange.id].sell / 100));
              console.log(exchange.id, pairsToSub[pair][exchange.id].reverse, ask)
            }
            else {
              // reverse, becouse we show USDT/BTC first
              ask =  (orderbooks[index]['bids'][0][0] * (1 - this.exchangeFees[exchange.id].buy / 100));
              bid =  (orderbooks[index]['asks'][0][0] * (1 - this.exchangeFees[exchange.id].sell / 100));
            }
            orderBookresults.push([bid, ask, exchange.id]);
            const pr1 = this.createPriceRecord(exchange.id, pair, bid)
            const pr2 = this.createPriceRecord(exchange.id, `${quaote}/${base}`, ask)
            Promise.all([pr1, pr2])

          });
          //calculate difference in exchanges
          const Differ1Ex2Ex = this.calculateBidAskDifference(orderBookresults[0], orderBookresults[1])
          const Differ1Ex3Ex = this.calculateBidAskDifference(orderBookresults[0], orderBookresults[2])
          // Pair EUR/USDT
          // --------------------- whitebit -------------------- kraken -----------------------------  bitstamp
          // EUR -> USDT        0.89461 USDT                 0.89811 USDT (+0.39%)                        0.89807 USDT (+0.38%)
          // USDT -> EUR        0.89451 USDT                 0.89801 USDT (+0.39%)                        0.89804 USDT (+0.39%)
          const result = `
          pair ${pair}
          ------------- ${exchanges[0].id} -------------------- ${exchanges[1].id} ------------------  ${exchanges[2].id}
          ${base} -> ${quaote} price ${orderBookresults[0][0].toFixed(5)} USDT\t${orderBookresults[1][0].toFixed(5)} USDT (${Differ1Ex2Ex[0] >= 0 ? '+' : ''}${Differ1Ex2Ex[0].toFixed(3)}%)\t ${orderBookresults[2][0].toFixed(5)} USDT (${Differ1Ex3Ex[0] >= 0 ? '+' : ''}${Differ1Ex3Ex[0].toFixed(3)}%)
          ${quaote} -> ${base} price ${orderBookresults[0][1].toFixed(5)} USDT\t${orderBookresults[1][1].toFixed(5)} USDT (${Differ1Ex2Ex[1] >= 0 ? '+' : ''}${Differ1Ex2Ex[1].toFixed(3)}%)\t ${orderBookresults[2][1].toFixed(5)} USDT (${Differ1Ex3Ex[1] >= 0 ? '+' : ''}${Differ1Ex3Ex[1].toFixed(3)}%)
          `;
          console.log(result)
          await this.sleep(this.configService.get<number>("INTERVAL_SLEEP_RESULT"))
        } catch (e) { 
          console.log('error startSymoblLoop',pair, e)
          await this.sleep(3)
        }
      }
    }

  calculateBidAskDifference(bookInfoEx1: [number, number, string], bookInfoEx2: [number, number, string]): [number, number, [string, string]] {
    const bidDiffer = this.calculatePercentageDifference(bookInfoEx1[0], bookInfoEx2[0])
    const askDiffer = this.calculatePercentageDifference(bookInfoEx1[1], bookInfoEx2[1])
    return [bidDiffer, askDiffer, [bookInfoEx1[2], bookInfoEx2[2]]]
  }

  calculatePercentageDifference(oldValue: number, newValue: number): number {
    const absoluteDifference = newValue - oldValue
    const percentageDifference = (absoluteDifference / oldValue) * 100;
    return percentageDifference;
  }

  async createPriceRecord(exchangeName: string, symbol: string, price: number): Promise<priceRecord> {
    const record = new priceRecord();
    record.timeAdded = Date.now();
    record.exchange = exchangeName;
    record.symbol = symbol;
    record.price = price;
    const savedRecord = await this.db.saveNewRecord(record);
    return savedRecord;
  }

  async sleep(seconds = 1): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }



}
  // save to big data structure

  // pair EUR/USDT
  // ------------- whitebit -------------------- kraken ------------------  bitstamp
  // EUR -> USDT price 1.11432 USDT        1.10851 USDT (-0.521%)   1.10891 USDT (-0.486%)
  // USDT -> EUR price 1.11419 USDT        1.10839 USDT (-0.521%)   1.10889 USDT (-0.476%)