/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import * as ccxt from 'ccxt';
import { SaverService } from './api.service';
//config service

@Injectable()
export class ExchangeService {
  markets: string[]
  
  constructor(
    private configService: ConfigService,
    private cctxBulk: SaverService) {
    this.markets = this.configService.get("ALLOWED_PAIRS")
  }

  async loadWS(): Promise<any> {
    const exchanges = await this.cctxBulk.getExchanges()
    console.log('exchagnes', exchanges)
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
    const symbols = await this.loadMarketsExchange(exchange)
    for (const symbol in symbols) { 
    const orderbook = await exchange.watchOrderBook(symbol)
      // save to big data structure
    }
  }
}