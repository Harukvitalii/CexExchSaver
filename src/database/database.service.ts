import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { priceRecord } from './priceRecord.model';
import { Op } from 'sequelize';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(priceRecord)
    private recordModel: typeof priceRecord,
  ) {
    priceRecord
      .sync({ force: false })
      .then(() => console.log('Record table synced'))
      .catch((error) => console.error('Error creating users table:', error));
    // Address.sync()
    // .then(() => console.log('Contract table synced'))
    // .catch((error) => console.error('Error creating contracts table:', error));
  }
  async saveNewRecord(record: priceRecord): Promise<priceRecord> {
    try {
      const res = await record.save();
      return res;
    } catch (error) {
      console.log(`error saving record ${record}, err: ${error.name} ${error}`);
      return error;
    }
  }

  async loadRecordsBetweenData(
    startDate: Date,
    endDate: Date,
  ): Promise<priceRecord[]> {
    try {
      const records = await this.recordModel.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'ASC']],
      });
      return records;
    } catch (error) {
      console.log(`error loading records, err: ${error.name}`);
      throw error;
    }
  }
  async loadRecords(): Promise<priceRecord[]> {
    try {
      const records = await this.recordModel.findAll();
      return records;
    } catch (error) {
      console.log(`error loading records, err: ${error.name}`);
      throw error;
    }
  }
}
