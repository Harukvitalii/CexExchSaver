import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/services/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';
import fs from 'fs';
import { ReactService } from '../services/react.service';
import {
  calculatedRecord,
  tableQuery,
  tableRecord,
} from '../interfaces/react.interface';

@Controller('table')
export class tableController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cexApi: SaverService,
    private readonly reactHelper: ReactService,
  ) {}

  @Get('/:startData/:endData/:step/:sort/:mainExchange')
  async startTable(
    @Param() tableQuery: tableQuery,
  ): Promise<calculatedRecord[]> {
    console.log(tableQuery);
    return this.reactHelper.loadTableRecords(tableQuery);
  }

  @Get('/single/:mainExchange')
  async SingleRecordPage(
    @Param() params: { mainExchange: string },
  ): Promise<calculatedRecord> {
    return this.reactHelper.singleRecordTable(params.mainExchange);
  }
}
