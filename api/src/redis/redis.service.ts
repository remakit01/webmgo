import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * Redis chỉ là cache/lock: lỗi Redis KHÔNG được làm sập request (quy tắc #5).
 * Mọi method bắt lỗi, log warn và trả giá trị "như cache miss" để caller fallback xuống DB.
 *
 * Cache JSON (getJson/setJson/delCache) nằm dưới tiền tố `cache:`. Trong lúc Redis gián đoạn, lệnh xoá cache
 * sau khi CMS lưu sẽ thất bại -> khi kết nối lại, xoá toàn bộ `cache:*` để không phục vụ dữ liệu cũ.
 */
const CACHE_PREFIX = 'cache:';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private hadOutage = false;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('redis.host', 'localhost'),
      port: configService.get<number>('redis.port', 6379),
      password: configService.get<string>('redis.password') || undefined,
      lazyConnect: true,
      // Redis mất kết nối -> lệnh báo lỗi ngay thay vì xếp hàng chờ (treo request)
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    this.client.on('error', (err: Error) => {
      this.hadOutage = true;
      this.logger.error('Redis error', err.message);
    });
    this.client.on('ready', () => {
      if (!this.hadOutage) return;
      this.hadOutage = false;
      void this.flushCache();
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Redis connected');
    } catch (err) {
      // API vẫn khởi động được; ioredis tự kết nối lại khi Redis sống lại
      this.logger.warn(`Redis chưa kết nối được, chạy không cache: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.client.quit().catch(() => undefined);
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      this.warn('GET', key, err);
      return null;
    }
  }

  async set(key: string, value: string, exMode: 'EX', ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, exMode, ttlSeconds);
    } catch (err) {
      this.warn('SET', key, err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.warn('DEL', key, err);
    }
  }

  /** Đọc cache JSON; dữ liệu hỏng coi như miss. */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(CACHE_PREFIX + key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJson(key: string, value: unknown, ttlSeconds: number) {
    return this.set(CACHE_PREFIX + key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  /** Xoá cache JSON (gọi sau khi CMS ghi dữ liệu). */
  delCache(key: string) {
    return this.del(CACHE_PREFIX + key);
  }

  /** Xoá mọi key `cache:*` bằng SCAN (không chặn Redis như KEYS). */
  async flushCache(): Promise<number> {
    let removed = 0;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.client.scan(cursor, 'MATCH', `${CACHE_PREFIX}*`, 'COUNT', 200);
        cursor = next;
        if (keys.length) removed += await this.client.del(...keys);
      } while (cursor !== '0');
      this.logger.warn(`Redis kết nối lại: đã xoá ${removed} key cache để tránh dữ liệu cũ`);
    } catch (err) {
      this.warn('FLUSH', `${CACHE_PREFIX}*`, err);
    }
    return removed;
  }

  /**
   * SET NX EX — true nếu giành được khoá (lock cho job định kỳ).
   * Redis lỗi -> false: thà bỏ một lượt job còn hơn chạy chồng nhiều instance.
   */
  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      return (await this.client.set(key, '1', 'EX', ttlSeconds, 'NX')) === 'OK';
    } catch (err) {
      this.warn('LOCK', key, err);
      return false;
    }
  }

  private warn(op: string, key: string, err: unknown) {
    this.logger.warn(`Redis ${op} "${key}" lỗi, fallback không cache: ${(err as Error).message}`);
  }
}
