import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { priceRecord } from './priceRecord.model';
import { LoggingService } from 'src/logger/logging.service';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly logger: LoggingService, // @InjectModel(Exchange) // private exchangeModel: typeof Exchange, // @InjectModel(Record) // private recordnModel: typeof Record,
    @InjectModel(priceRecord)
    private recordModel: typeof priceRecord,
  ) {
    // Record.sync({ force: true })
    //   .then(() => console.log('Record table synced'))
    //   .catch((error) => console.error('Error creating users table:', error));
    // Address.sync()
    // .then(() => console.log('Contract table synced'))
    // .catch((error) => console.error('Error creating contracts table:', error));
  }
  async saveNewAddress(record: priceRecord): Promise<priceRecord> {
    try {
      const res = await record.save();
      return res;
    } catch (error) {
      this.logger.log(`error sa address ${record}, err: ${error.name}`);
      return record;
    }
  }
}
