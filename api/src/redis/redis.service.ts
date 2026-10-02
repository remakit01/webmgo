import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('redis.host', 'localhost'),
      port: configService.get<number>('redis.port', 6379),
      password: configService.get<string>('redis.password') || undefined,
      lazyConnect: true,
    });

    this.client.on('error', (err: Error) => this.logger.error('Redis error', err.message));
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Redis connected');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  get(key: string) {
    return this.client.get(key);
  }

  set(key: string, value: string, exMode: 'EX', ttlSeconds: number) {
    return this.client.set(key, value, exMode, ttlSeconds);
  }

  /** SET NX EX — trả true nếu giành được khoá (dùng làm lock cho job chạy định kỳ). */
  async acquireLock(key: string, ttlSeconds: number) {
    return (await this.client.set(key, '1', 'EX', ttlSeconds, 'NX')) === 'OK';
  }

  del(key: string) {
    return this.client.del(key);
  }
}
