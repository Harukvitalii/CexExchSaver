import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CexSaverModule } from './cex/api.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { priceRecord } from './database/priceRecord.model';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskController } from './deamons/trans.deamon.controller';
import { BackgroundService } from './deamons/trans.deamon.provider';
import { SaverService } from './cex/api.service';
import { MyConfigModule } from './configuration/config.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseService } from './database/database.service';
import { GraphController } from './react.endp/graph.controller';
import { ReactService } from './react.endp/react.service';
import { tableController } from './react.endp/table.controller';
// import { RedisCacheModule } from './redis/redis.module';
// import { RedisCacheService } from './redis/redis.service';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('pghost'),
        port: configService.get<number>('pgport'),
        username: configService.get<string>('pgusername'),
        password: configService.get<string>('pgpassword'),
        database: configService.get<string>('pgdatabase'),
        models: [priceRecord],
        dialectOptions: {
          pool: false,
        },
      }),
    }),
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
