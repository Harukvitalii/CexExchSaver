import { Module } from '@nestjs/common';
import { SaverService } from './api.service';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from 'src/redis/redis.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SaverService, ConfigService, RedisCacheService],
})
export class CexSaverModule {}
