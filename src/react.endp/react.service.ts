/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import { DatabaseService } from 'src/database/database.service';
import { calculatedRecord, stepIntervals, tableRecord } from './react.interface';
import { priceRecord } from 'src/database/priceRecord.model';



@Injectable()
export class reactService {

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
  filterRecordsGraph(records: priceRecord[], stepNumber: number, symbol = 'EUR/USDT') {
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
            const differenceWhiteBitstamp: number = this.calculatePercentageDifference(whitebitRec.price, bitstampRec.price);
            const differenceWhiteKraken: number = this.calculatePercentageDifference(whitebitRec.price, krakenRec.price);
            TableRecords.push({
              datetime: whitebitRec.addedAt,
              whitebitPrice: whitebitRec.price.toFixed(digitsAfterDot),
              bitstampPrice: bitstampRec.price.toFixed(digitsAfterDot),
              krakenPrice: krakenRec.price.toFixed(digitsAfterDot),
              diffWhiteBitstamp: differenceWhiteBitstamp.toFixed(digitsAfterDot),
              diffWhiteKraken: differenceWhiteKraken.toFixed(digitsAfterDot)
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

}
