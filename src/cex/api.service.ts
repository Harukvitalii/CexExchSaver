/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import * as ccxt from 'ccxt';
//config service

@Injectable()
export class SaverService {
  markets: string[]
  
  constructor(private configService: ConfigService) {
    this.markets = this.configService.get("ALLOWED_PAIRS")
  }

  async getExcanges(): Promise<any> {
    const exchanges = await Promise.all(
      this.markets.map(async (id: string): Promise<ccxt.Exchange> => {
        const CCXT = ccxt as any;
        const exchange = new CCXT[id]({
          enableRateLimit: true,
        }) as ccxt.Exchange;
      const exchangeExtended = exchange.extend({ "name": id, "class": exchange }) as ccxt.Exchange;
      return exchangeExtended;
  }));
    console.log(exchanges)
    return '';

  
  }
  async loadMarketsExchange(exchange: ccxt.Exchange): Promise<string[]> {
    const existingPairs: string[]  = []
    const exchangeMarkets = await exchange.loadMarkets()
    for(const symbol in this.markets) {
      for(const [marketId, market] of Object.entries(exchangeMarkets)){ 
        if (market.symbol === symbol){
          console.log(marketId)
          existingPairs.push(symbol)
        } // adding checking reverse BTC/ETH, ETH/BTC
      }
    }
    return existingPairs
  }

  async startWsExchange(exchange: ccxt.Exchange) { 
    const symbols = await loadMarketsExchange(exchange)
    for (const symbol in symbols) { 
    const orderbook = await exchange.watchOrderBook(symbol)
      // save to big data structure
    }
  }
}