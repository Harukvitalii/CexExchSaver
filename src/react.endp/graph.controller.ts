import { Controller, Get, Query } from '@nestjs/common';
import { SaverService } from 'src/cex/api.service';
import { DatabaseService } from 'src/database/database.service';

import { ReactService } from './react.service';
import { calculatedRecord, graphQuery } from './react.interface';

@Controller('graph')
export class graphController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cexApi: SaverService,
    private readonly reactHelepr: ReactService,
  ) {}

  @Get(':startData/:endData/:step')
  async startGraph(
    @Query('graphQuery') graphQuery: graphQuery,
  ): Promise<calculatedRecord[]> {
    return this.reactHelepr.loadGraphRecords(graphQuery);
  }
}
