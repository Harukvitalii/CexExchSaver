import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CexSaverModule } from './cex/cex.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { priceRecord } from './database/priceRecord.model';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskController } from './deamons/trans.deamon.controller';
import { BackgroundService } from './deamons/trans.deamon.provider';
import { SaverService } from './cex/services/api.service';
import { MyConfigModule } from './configurations/config.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseService } from './database/database.service';
import { GraphController } from './react.endp/controllers/graph.controller';
import { ReactService } from './react.endp/services/react.service';
import { tableController } from './react.endp/controllers/table.controller';
import { SequelizeConfigModule } from './configurations/sequalize.config';
// import { RedisCacheModule } from './redis/redis.module';
// import { RedisCacheService } from './redis/redis.service';

@Module({
  imports: [
    SequelizeConfigModule,
    CexSaverModule,
    DatabaseModule,
    MyConfigModule,
    // RedisCacheModule,
    SequelizeModule.forFeature([priceRecord]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    AppController,
    TaskController,
    GraphController,
    tableController,
  ],
  providers: [
    AppService,
    ConfigService,
    SaverService,
    DatabaseService,
    BackgroundService,
    ReactService,
    // RedisCacheService,
  ],
})
export class AppModule {}
