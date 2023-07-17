import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
    // or
    // this.redis = this.redisService.getClient(DEFAULT_REDIS_NAMESPACE);
  }

  async set(key: string, value: any) {
    return await this.redis.set(key, value, 'EX', 100000);
  }
  async get(key: string) {
    return await this.redis.get(key);
  }
  async hset(hashName: string, key: string, value: any) {
    await this.redis.hset(hashName, key, value);
  }
  async hmset(hashName: string, value: (string | number | Buffer)[]) {
    await this.redis.hmset(hashName, value);
  }

  async hgetall(hashName) {
    return await this.redis.hgetall(hashName);
  }
}
