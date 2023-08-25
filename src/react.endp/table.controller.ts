import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';
import fs from 'fs';
import { ReactService } from './react.service';
import { calculatedRecord, tableQuery, tableRecord } from './react.interface';

@Controller('table')
export class tableController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cexApi: SaverService,
    private readonly reactHelper: ReactService,
  ) {}

  @Get(':startData/:endData/:step/:sortby')
  async startTable(
    @Query('tableQuery') tableQuery: tableQuery,
  ): Promise<calculatedRecord[]> {
    return this.reactHelper.loadTableRecords(tableQuery);
  }

  @Get('/single')
  async SingleRecordPage(): Promise<calculatedRecord> {
    return this.reactHelper.singleRecordTable();
  }
}
