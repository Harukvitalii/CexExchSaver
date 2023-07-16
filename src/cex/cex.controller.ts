import { Controller, Get } from '@nestjs/common';
import { SaverService } from './api.service';
import { ExchangeService } from './exchnage.service';
import { ConfigService } from '@nestjs/config';

@Controller('testing')
export class CexController {
  constructor(
    private readonly saver: ExchangeService,
    private readonly cctxBulk: SaverService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async testingFunctions() {
    const res = await this.cctxBulk.getExchanges();
    const markets = res['whitebit'].class.markets;
    // console.log(res);
    return markets;
  }
}
