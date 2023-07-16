/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import * as ccxt from 'ccxt';
//config service

export interface CexSaverExchange {
  class: ccxt.Exchange, 
  pairs?: ccxt.Dictionary<ccxt.Market>
}


@Injectable()
export class SaverService {
  markets: string[]
  exchanges: string[]
  
  constructor(private configService: ConfigService) {
    this.markets = JSON.parse(this.configService.get("ALLOWED_PAIRS"))
    this.exchanges = JSON.parse(this.configService.get("ALLOWED_EXCHANGES_WS"))
  }

  async getExchanges(): Promise<{ [name: string]: CexSaverExchange }> {
    console.log('markets: ', this.exchanges)
    const exchangeInst: { [name: string]: CexSaverExchange} = {};
    await Promise.all(
      this.exchanges.map(async (id: string) => {
        try {
          const CCXT = ccxt.pro as any;
          const cex: CexSaverExchange = {
              class: new CCXT[id]({
                  enableRateLimit: true,
              }) as ccxt.Exchange,
          };
          await cex.class.loadMarkets()
          exchangeInst[id] = cex;
      } catch (error) {
          console.error(`Error creating exchange ${id}:`, error);
          console.log('Available exchanges:', ccxt.exchanges);
          throw error;
      }
  }));
    return exchangeInst;

  
  }

  // async startWsExchange(exchange: ccxt.Exchange) { 
  //   const symbols = await this.loadMarketsExchange(exchange)
  //   for (const symbol in symbols) { 
  //   const orderbook = await exchange.watchOrderBook(symbol)
  //     // save to big data structure
  //   }
  // }
}