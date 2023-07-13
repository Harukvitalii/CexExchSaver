import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Exchange } from './exchange.model';
import { LoggingModule } from 'src/logger/logging.module';
import { Record } from './record.model';

@Module({
  imports: [SequelizeModule.forFeature([Exchange, Record]), LoggingModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
