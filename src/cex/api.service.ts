/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import * as ccxt from 'ccxt';
import { ExchangeFees } from './cex.interface';
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
    try { 
      const pairsToSubscribeExs = exchanges.map(exchange => exchange.symbols.filter(symbol  => this.pairs.includes(symbol)))
      const pairsToSub = this.getMatchingPairs(pairsToSubscribeExs)
      
      const notIncludedPairs = this.pairs.filter(pair => !pairsToSub.includes(pair));
      console.log(`pairs to subscribe = ${pairsToSub}, pairs that are not in all exchanges = ${notIncludedPairs}`)
      // const pairsToSub = this.pairs;
   
      await Promise.all(pairsToSub.map(symbol => this.startSymoblLoop(exchanges, symbol)))
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
  
  
      
  
  async startSymoblLoop(exchanges: ccxt.Exchange[], symbol: string) { 
      console.log('Starting loop')
      while (true) { 
        try { 
          const [base, quaote] = symbol.split('/')
          
          const orderBookPromises = exchanges.map(exchange => exchange.fetchOrderBook(symbol));
          const orderbooksPromise: Promise<ccxt.OrderBook[]> = Promise.all(orderBookPromises)
          const orderbooks = await orderbooksPromise
          const orderBookresults = [];

          // Loop through each exchange and calculate the bid and ask prices
          exchanges.forEach((exchange, index) => {
            const bid = orderbooks[index]['bids'][0][0] * (1 - this.exchangeFees[exchange.id].buy / 100);
            const ask = orderbooks[index]['asks'][0][0] * (1 - this.exchangeFees[exchange.id].sell / 100);
            orderBookresults.push([bid, ask, exchange.id]);
            const pr1 = this.createPriceRecord(exchange.id, symbol, bid)
            const pr2 = this.createPriceRecord(exchange.id, `${quaote}/${base}`, 1/ask)
            Promise.all([pr1, pr2])

          });
          
          const Differ1Ex2Ex = this.calculateBidAskDifference(orderBookresults[0], orderBookresults[1])
          const Differ1Ex3Ex = this.calculateBidAskDifference(orderBookresults[0], orderBookresults[2])

          const result = `
          ------------- ${exchanges[0].id} ---------------- ${exchanges[1].id} ----------------  ${exchanges[2].id}
          ${base}/${quaote} price ${orderBookresults[0][0].toFixed(3)}     (bid): price ${orderBookresults[1][0].toFixed(3)} diff ${Differ1Ex2Ex[0].toFixed(3)}  price price ${orderBookresults[2][0].toFixed(3)}(bid): ${Differ1Ex3Ex[0].toFixed(3)}
          ${quaote}/${base} price ${orderBookresults[0][1].toFixed(3)}     (ask): price ${orderBookresults[1][1].toFixed(3)} diff ${Differ1Ex2Ex[1].toFixed(3)}  price price ${orderBookresults[2][1].toFixed(3)}(ask): ${Differ1Ex3Ex[1].toFixed(3)}
          `;
          console.log(result)
          await this.sleep(30)
        } catch (e) { 
          console.log('error startSymoblLoop',symbol, e)
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

