import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SaverService } from 'src/cex/api.service';
import * as ccxt from 'ccxt';
import { Cron, Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { priceRecord } from 'src/database/priceRecord.model';
import fs from 'fs';
import { reactService } from './react.service';
import { tableRecord } from './react.interface';

@Controller('table')
export class tableController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cexApi: SaverService,
    private readonly reactHelper: reactService,
  ) {}

  @Get(':startData/:endData/:step/:sortby/:exchange')
  async startGraph(
    @Param('startData') startData: string,
    @Param('endData') endData: string,
    @Param('step') step: string,
    @Param('sortby') sort: string,
    @Param('exchange') toExchange: string,
  ) {
    console.log(startData, endData);
    // const records: priceRecord[] = await this.db.loadRecords();
    const records: priceRecord[] = await this.db.loadRecordsBetweenData(
      new Date(startData),
      new Date(endData),
    );
    const stepNumber: number = this.reactHelper.convertIntervalToStep(step);

    const filteredRecords: tableRecord[] = this.reactHelper.filterRecords(
      toExchange,
      records,
      stepNumber,
    );
    // console.log(filteredRecords.slice(0, 10));

    const [sortField, sortType] = sort.split(' ') as [
      keyof tableRecord,
      'asc' | 'desc',
    ];
    const sortedTableRecords = this.reactHelper.sortByProperty(
      filteredRecords,
      sortField,
      sortType,
    );
    // console.log(sortedTableRecords.slice(0, 5));
    // console.log(toExchange);
    return sortedTableRecords.slice(0, 300);
  }
}
