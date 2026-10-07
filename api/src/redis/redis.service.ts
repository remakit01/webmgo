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

  /**
   * Đọc cache, miss thì gọi loader (DB) rồi lưu cache. Redis lỗi -> vẫn trả dữ liệu từ loader (quy tắc #5).
   * Kết quả null/undefined không được cache (vd bài chưa tồn tại) để bài mới đăng hiện ngay.
   */
  async cacheOrLoad<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached !== null) return cached;
    const value = await loader();
    if (value !== null && value !== undefined) await this.setJson(key, value, ttlSeconds);
    return value;
  }

  /** Xoá mọi cache JSON có key bắt đầu bằng prefix (vd 'news:') — dùng khi một thay đổi ảnh hưởng nhiều trang. */
  delCacheByPrefix(prefix: string): Promise<number> {
    return this.deleteByPattern(`${CACHE_PREFIX}${prefix}*`, 'DEL_PREFIX');
  }

  /** Xoá mọi key `cache:*` bằng SCAN (không chặn Redis như KEYS). */
  async flushCache(): Promise<number> {
    const removed = await this.deleteByPattern(`${CACHE_PREFIX}*`, 'FLUSH');
    this.logger.warn(`Redis kết nối lại: đã xoá ${removed} key cache để tránh dữ liệu cũ`);
    return removed;
  }

  private async deleteByPattern(pattern: string, op: string): Promise<number> {
    let removed = 0;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = next;
        if (keys.length) removed += await this.client.del(...keys);
      } while (cursor !== '0');
    } catch (err) {
      this.warn(op, pattern, err);
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

  /**
   * SET NX EX — true: khoá mới được đặt; false: khoá đã có; null: Redis lỗi (caller tự quyết, vd vẫn đếm lượt xem).
   * Khác acquireLock (lỗi -> false) vì ở đây "không biết" phải phân biệt được với "đã có".
   */
  async setIfAbsent(key: string, ttlSeconds: number): Promise<boolean | null> {
    try {
      return (await this.client.set(key, '1', 'EX', ttlSeconds, 'NX')) === 'OK';
    } catch (err) {
      this.warn('SETNX', key, err);
      return null;
    }
  }

  /**
   * Chạy fn khi giành được lock (job định kỳ nhiều instance); không giành được -> bỏ lượt, trả undefined.
   * Luôn nhả lock sau khi chạy xong, kể cả khi fn lỗi.
   */
  async withLock<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T | undefined> {
    if (!(await this.acquireLock(key, ttlSeconds))) return undefined;
    try {
      return await fn();
    } finally {
      await this.del(key);
    }
  }

  private warn(op: string, key: string, err: unknown) {
    this.logger.warn(`Redis ${op} "${key}" lỗi, fallback không cache: ${(err as Error).message}`);
  }
}
