import { Controller, Get } from '@nestjs/common';
import { SaverService } from './api.service';
import { ConfigService } from '@nestjs/config';
import * as ccxt from 'ccxt';

@Controller('testing')
export class CexController {
  constructor(
    private readonly cctxBulk: SaverService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async testingFunctions() {
    const started = [];
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

    return started;
  }
}
