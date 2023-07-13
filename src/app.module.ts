import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CexSaverModule } from './cex/api.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Record } from './database/record.model';
import { Exchange } from './database/exchange.model';
import { DatabaseService } from './database/database.service';
import { DatabaseController } from './database/database.controller';
import { DatabaseModule } from './database/database.module';
import { LoggingService } from './logger/logging.service';

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
        models: [Record, Exchange],
        dialectOptions: {
          pool: false,
        },
      }),
    }),
    CexSaverModule,
    DatabaseModule,
  ],
  controllers: [AppController, DatabaseController],
  providers: [AppService, ConfigService, DatabaseService, LoggingService],
})
export class AppModule {}
