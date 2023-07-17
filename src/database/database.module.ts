import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggingModule } from 'src/logger/logging.module';
import { priceRecord } from './priceRecord.model';

@Module({
  imports: [SequelizeModule.forFeature([priceRecord]), LoggingModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
