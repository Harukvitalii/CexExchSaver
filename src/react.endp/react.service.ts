/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import { DatabaseService } from 'src/database/database.service';
import { stepIntervals } from './react.interface';
import { priceRecord } from 'src/database/priceRecord.model';
import { tableRecord } from 'src/cex/cex.interface';



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

  filterRecords(toExchange: string, records: priceRecord[], stepNumber: number) {
    const digitsAfterDot = Number(process.env.digitsAfterDotInTable)
    const filteredRecords = records.filter(
        (rec) => rec.dataValues.symbol === 'EUR/USDT',
      );
      const recordsByGroup = new Map<string, priceRecord[]>();
      for (const rec of filteredRecords) {
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

  calculatePercentageDifference(oldValue: number, newValue: number): number {
    const absoluteDifference = newValue - oldValue
    const percentageDifference = (absoluteDifference / oldValue) * 100;
    return percentageDifference;
  }
  sortByProperty(
    array: tableRecord[],
    property: keyof tableRecord,
    direction: "asc" | "desc" = "asc"
  ): tableRecord[] {
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
