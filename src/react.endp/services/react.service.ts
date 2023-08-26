/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import { DatabaseService } from 'src/database/database.service';
import { calculatedRecord, graphQuery, stepIntervals, tableQuery, tableRecord } from '../interfaces/react.interface';
import { priceRecord } from 'src/database/priceRecord.model';



@Injectable()
export class ReactService {

  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {}

  convertIntervalToStep(interval) {
    const match = interval.match(/^(\d+)\s*(\w+)$/);
    if (match) {
      const quantity = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'seconds' || unit === 'second') {
        return 1;
      }
      const multiplier = stepIntervals[unit];
      if (multiplier) {
        return multiplier * quantity;
      }
    }
    return null; // Invalid interval
  }

  filterRecords(toExchange: string, records: priceRecord[], stepNumber: number, symbol = 'EUR/USDT') {
    const digitsAfterDot = Number(process.env.digitsAfterDotInTable)
    const filteredRecords = records.filter(
        (rec) => rec.dataValues.symbol === symbol,
      );
      const GroupGraphData = this.groupRecords(filteredRecords)

      const filteredByStepRecords = GroupGraphData.filter(
          (record, index) => index % stepNumber === 0,
        );
        
        const TableRecords: tableRecord[] = []
        for (const records of filteredByStepRecords) { 
            const whitebitRec = records.filter(info => info.exchange === 'whitebit')[0];
            const toExchangeRec = records.filter(info => info.exchange === toExchange)[0];
            const difference:number = this.calculatePercentageDifference(whitebitRec.price, toExchangeRec.price);
            TableRecords.push({datetime: whitebitRec.addedAt, whitebitPrice: whitebitRec.price.toFixed(digitsAfterDot), toExchangePrice: toExchangeRec.price.toFixed(digitsAfterDot), difference: difference.toFixed(digitsAfterDot)})
        }
        return TableRecords
  }
  filterRecordsGraph(records: priceRecord[], stepNumber: number, symbol = 'EUR/USDT', mainExchange: string) {
    const digitsAfterDot = Number(process.env.digitsAfterDotInTable)
    const filteredRecords = records.filter(
        (rec) => rec.dataValues.symbol === symbol,
      );
      const GroupGraphData = this.groupRecords(filteredRecords)
      
      const filteredByStepRecords = GroupGraphData.filter(
          (record, index) => index % stepNumber === 0,
        );
        
        const TableRecords: calculatedRecord[] = []
        for (const records of filteredByStepRecords) { 
          try {
            const whitebitRec = records.filter(info => info.exchange === 'whitebit')[0];
            const bitstampRec = records.filter(info => info.exchange === "bitstamp")[0];
            const krakenRec   = records.filter(info => info.exchange === "kraken")[0];

            let [differenceMainBitstamp, differenceMainKraken, differenceMainWhitebit] = [0, 0, 0]
            if (mainExchange === 'whitebit') {
              differenceMainBitstamp = this.calculatePercentageDifference(whitebitRec.price, bitstampRec.price);
              differenceMainKraken = this.calculatePercentageDifference(whitebitRec.price, krakenRec.price);
              // differenceMainWhitebit = 0
            } else if (mainExchange === 'kraken') {
              differenceMainBitstamp = this.calculatePercentageDifference(krakenRec.price, bitstampRec.price);
              // differenceMainKraken = 0
              differenceMainWhitebit = this.calculatePercentageDifference(krakenRec.price, whitebitRec.price);
            } else if (mainExchange === 'bitstamp') {
              differenceMainWhitebit = this.calculatePercentageDifference(bitstampRec.price, whitebitRec.price);
              differenceMainKraken = this.calculatePercentageDifference(bitstampRec.price, krakenRec.price);
            }
            TableRecords.push({
              datetime: krakenRec.addedAt,
              whitebitPrice: whitebitRec.price.toFixed(digitsAfterDot),
              bitstampPrice: bitstampRec.price.toFixed(digitsAfterDot),
              krakenPrice: krakenRec.price.toFixed(digitsAfterDot),
              diffMainBitstamp: differenceMainBitstamp.toFixed(digitsAfterDot),
              diffMainKraken: differenceMainKraken.toFixed(digitsAfterDot),
              diffMainWhitebit: differenceMainWhitebit.toFixed(digitsAfterDot),
            })
          } catch (e) {
            console.log('not all data was loaded')
          }
        }
        return TableRecords
  }


  groupRecords(records: priceRecord[]) {
    const recordsByGroup = new Map<string, priceRecord[]>();
    for (const rec of records) {
      const groupHash = rec.dataValues.groupHash;
      if (recordsByGroup.has(groupHash)) {
        recordsByGroup.get(groupHash).push(rec);
      } else {
        recordsByGroup.set(groupHash, [rec]);
      }
    }
    // console.log(recordsByGroup);
    const GroupGraphData = [];
    for (const recs of recordsByGroup.values()) {
      const result = recs.map((priceRecord) => ({
        exchange: priceRecord.dataValues.exchange,
        addedAt: new Date(parseInt(priceRecord.dataValues.timeAdded, 10)),
        price: priceRecord.dataValues.price,
      }));
      GroupGraphData.push(result);
    }
    return GroupGraphData
  }

  calculatePercentageDifference(oldValue: number, newValue: number): number {
    const absoluteDifference = newValue - oldValue
    const percentageDifference = (absoluteDifference / oldValue) * 100;
    return percentageDifference;
  }
  sortByProperty(
    array: calculatedRecord[],
    property: keyof calculatedRecord,
    direction: "asc" | "desc" = "asc"
  ): calculatedRecord[] {
    // console.log('array' , array)
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {

  
      if (property === "datetime") {
        const dateA = new Date(a[property]);
        const dateB = new Date(b[property]);
  
        if (dateA < dateB) {
          return direction === "asc" ? -1 : 1;
        }
        if (dateA > dateB) {
          return direction === "asc" ? 1 : -1;
        }
        return 0;
      }
      const valueA = Number(a[property]);
      const valueB = Number(b[property]);
      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  
    return sortedArray;
  }
  async singleRecordTable(mainExchange: string): Promise<calculatedRecord> {
    const records: priceRecord[] = await this.db.loadLastRecord();
    const filteredRecords: calculatedRecord[] =
      this.filterRecordsGraph(records, 1, 'EUR/USDT', mainExchange);

    // console.log(toExchange);
    return filteredRecords[0];
  }




  async loadTableRecords(tableQuery: tableQuery): Promise<calculatedRecord[]> {
    console.log(tableQuery.startData, tableQuery.endData);
    // const records: priceRecord[] = await this.db.loadRecords();
    const records: priceRecord[] = await this.db.loadRecordsBetweenData(
      new Date(tableQuery.startData),
      new Date(tableQuery.endData),
    );
    const stepNumber: number = this.convertIntervalToStep(
      tableQuery.step,
    );

    const filteredRecords: calculatedRecord[] =
      this.filterRecordsGraph(records, stepNumber, 'EUR/USDT', tableQuery.mainExchange);
    // console.log(filteredRecords.slice(0, 10));

    const [sortField, sortType] = tableQuery.sort.split(' ') as [
      keyof calculatedRecord,
      'asc' | 'desc',
    ];
    const sortedTableRecords = this.sortByProperty(
      filteredRecords,
      sortField,
      sortType,
    );
    console.log(sortedTableRecords.slice(0, 5));
    // console.log(toExchange);
    return sortedTableRecords.slice(0, 300);
  }


  async loadGraphRecords(graphQuery: graphQuery): Promise<calculatedRecord[]> {
    console.log(graphQuery.startData, graphQuery.endData);
    // const records: priceRecord[] = await this.db.loadRecords();
    const records: priceRecord[] = await this.db.loadRecordsBetweenData(
      new Date(graphQuery.startData),
      new Date(graphQuery.endData),
    );
    const stepNumber: number = this.convertIntervalToStep(
      graphQuery.step,
    );
    const calculatedRecords: calculatedRecord[] =
      this.filterRecordsGraph(records, stepNumber, 'EUR/USDT', graphQuery.mainExchange);
    return calculatedRecords;
  }
}
