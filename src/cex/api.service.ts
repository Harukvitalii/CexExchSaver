/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import * as ccxt from 'ccxt';

//config service

interface cexPairs {
  [name: string]: Record<string, Record<string, number>>; // Allows any string key and values of type Record<string, Record<string, number>>
}


@Injectable()
export class SaverService {
  pairs: string[]
  exchanges: string[]
  cex_pairs: cexPairs
  
  constructor(private configService: ConfigService) {
    this.pairs     = JSON.parse(this.configService.get("ALLOWED_PAIRS"))
    this.exchanges = JSON.parse(this.configService.get("ALLOWED_EXCHANGES_WS"))
    this.cex_pairs = {}
  }

  async getExchanges(): Promise<{ [name: string]: ccxt.Exchange }> {
    console.log('markets: ', this.exchanges)
    const exchangeInst: { [name: string]: ccxt.Exchange} = {};
    await Promise.all(
      this.exchanges.map(async (id: string) => {
        try {
          const CCXT = ccxt.pro as any;
          const cex: ccxt.Exchange = new CCXT[id]({
            enableRateLimit: true,
        })
         
          let retries = 3;
          let success = false;
    
          while (retries > 0 && !success) {
            try {
              await cex.loadMarkets();
              success = true;
            } catch (error) {
              retries--;
              console.error(`Error creating exchange ${id}:`, error);
              console.log(`Retrying ${3 - retries}/${3} in 500 ms...`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
    
          if (success) {
            exchangeInst[id] = cex;
          } else {
            console.error(`Failed to create exchange ${id}: maximum retries exceeded`);
            console.log('Available exchanges:', ccxt.exchanges);
          }
      } catch (error) {
          console.error(`Error creating exchange ${id}:`, error);
          console.log('Available exchanges:', ccxt.exchanges);
          throw error;
      }
  }));
    return exchangeInst;
  }


  async startOrderBookListener(exchange: ccxt.Exchange) { 
    try { 
      const pairsToSubscribe = exchange.symbols.filter(symbol => this.pairs.includes(symbol));
      console.log("symb to subscribe", pairsToSubscribe)
      await Promise.all(pairsToSubscribe.map(symbol => this.startSymoblListener(exchange, symbol)))
    } catch (e) { 
      console.log('error startOrderBookListener')
    }
  }
      
  async startSymoblListener(exchange: ccxt.Exchange, symbol: string) { 
      while (true) { 
        try { 
          const orderbook = await exchange.watchOrderBook(symbol)
          await this.handleWS_symbol(exchange, symbol, orderbook)
        } catch (e) { 
          console.log('error startSymoblListener',symbol, e)
        }
      }
    }


  async handleWS_symbol(exchange: ccxt.Exchange, symbol: string, orderbook: ccxt.OrderBook) {
    const bid = orderbook['bids'][0][0]
    const ask = orderbook['asks'][0][0]
    this.save_pair_info(exchange.id, symbol, ask, bid)
    console.log(new Date (), this.cex_pairs)

    //save
    //
  }
  // save to big data structure

  save_pair_info(name: string, symbol: string, price_ask: number, price_bid: number) {
    const [symbol0, symbol1] = symbol.split('/');
  
    if (!this.cex_pairs[name]) {
      this.cex_pairs[name] = {};
    }
  
    if (this.cex_pairs[name][symbol0] && this.cex_pairs[name][symbol0][symbol1]) {
      this.cex_pairs[name][symbol0][symbol1] = price_ask;
    } else {
      if (!this.cex_pairs[name][symbol0]) {
        this.cex_pairs[name][symbol0] = {};
      }
      this.cex_pairs[name][symbol0][symbol1] = price_ask;
    }
  
    if (this.cex_pairs[name][symbol1] && this.cex_pairs[name][symbol1][symbol0]) {
      this.cex_pairs[name][symbol1][symbol0] = 1 / price_bid;
    } else {
      if (!this.cex_pairs[name][symbol1]) {
        this.cex_pairs[name][symbol1] = {};
      }
      this.cex_pairs[name][symbol1][symbol0] = 1 / price_bid;
    }
  }
}