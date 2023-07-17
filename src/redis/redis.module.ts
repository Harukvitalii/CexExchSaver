import { Module, Injectable } from '@nestjs/common';
import {
  RedisModule,
  RedisOptionsFactory,
  RedisModuleOptions,
} from '@liaoliaots/nestjs-redis';
import { RedisCacheService } from './redis.service';

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {
  async createRedisOptions(): Promise<RedisModuleOptions> {
    return {
      config: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}

@Module({
  imports: [
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
  ],
  controllers: [],
  providers: [RedisCacheService],
})
export class RedisCacheModule {}
