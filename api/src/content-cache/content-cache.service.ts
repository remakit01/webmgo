import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export interface InvalidateTarget {
  /** Key cache cụ thể (không gồm tiền tố `cache:`) */
  keys?: string[];
  /** Xoá mọi key bắt đầu bằng prefix (vd 'news:') */
  prefixes?: string[];
  /** Tag ISR của fe cần revalidate (phải có trong whitelist fe/src/app/api/revalidate) */
  tags?: string[];
}

/**
 * Bước "sau khi ghi dữ liệu" dùng chung mọi module: xoá cache Redis rồi báo fe revalidate.
 * Cả hai bước đều không ném lỗi (Redis lỗi chỉ log, revalidate lỗi chỉ log) nên không làm hỏng request ghi.
 */
@Injectable()
export class ContentCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly revalidate: RevalidateService,
  ) {}

  async invalidate({ keys = [], prefixes = [], tags = [] }: InvalidateTarget) {
    await Promise.all([
      ...keys.map((k) => this.redis.delCache(k)),
      ...prefixes.map((p) => this.redis.delCacheByPrefix(p)),
    ]);
    if (tags.length) await this.revalidate.trigger(...tags);
  }
}
