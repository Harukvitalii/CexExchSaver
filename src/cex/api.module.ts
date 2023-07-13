import { Module } from '@nestjs/common';
import { SaverService } from './api.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [SaverService, ConfigService],
})
export class CexSaverModule {}
