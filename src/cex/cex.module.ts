import { Module } from '@nestjs/common';
import { SaverService } from './services/api.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { priceRecord } from 'src/database/priceRecord.model';

@Module({
  imports: [SequelizeModule.forFeature([priceRecord])],
  controllers: [],
  providers: [SaverService, ConfigService, DatabaseService],
})
export class CexSaverModule {}
