import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/api.service';
import * as ccxt from 'ccxt';

@Injectable()
export class BackgroundService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly cctxBulk: SaverService,
  ) {}
  async onApplicationBootstrap() {
    console.log('start events');
    // this.eventEmitter.emit('start_exchange_motinoring');
  }

  @OnEvent('start_exchange_motinoring')
  async myFunction() {
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
}
