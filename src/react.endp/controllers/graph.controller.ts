import { Controller, Get, Param, Query } from '@nestjs/common';
import { SaverService } from 'src/cex/services/api.service';
import { DatabaseService } from 'src/database/database.service';

import { ReactService } from '../services/react.service';
import { calculatedRecord, graphQuery } from '../interfaces/react.interface';

@Controller('graph')
export class GraphController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cexApi: SaverService,
    private readonly reactHelper: ReactService,
  ) {}

  @Get('/:startData/:endData/:step/:mainExchange')
  async startGraph(
    @Param() graphQuery: graphQuery,
  ): Promise<calculatedRecord[]> {
    return this.reactHelper.loadGraphRecords(graphQuery);
  }
}
