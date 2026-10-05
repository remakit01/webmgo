import { RedisService } from './redis.service.js';

const config = { get: (_key: string, fallback?: unknown) => fallback } as never;

function withClient(client: Record<string, unknown>) {
  const redis = new RedisService(config);
  (redis as unknown as { client: Record<string, unknown> }).client = client;
  return redis;
}

describe('RedisService.cacheOrLoad', () => {
  it('Redis lỗi -> vẫn trả dữ liệu từ loader, không ném lỗi', async () => {
    const fail = vi.fn(async () => {
      throw new Error('Connection is closed.');
    });
    const redis = withClient({ get: fail, set: fail });
    const loader = vi.fn(async () => ({ items: [1] }));
    await expect(redis.cacheOrLoad('news:x', 60, loader)).resolves.toEqual({ items: [1] });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('cache hit không gọi loader; kết quả null không được cache', async () => {
    const store = new Map<string, string>();
    const redis = withClient({
      get: async (k: string) => store.get(k) ?? null,
      set: async (k: string, v: string) => void store.set(k, v),
    });
    const loader = vi.fn(async () => 'v');
    await redis.cacheOrLoad('k', 60, loader);
    await redis.cacheOrLoad('k', 60, loader);
    expect(loader).toHaveBeenCalledTimes(1);

    await redis.cacheOrLoad('missing', 60, async () => null);
    expect(store.has('cache:missing')).toBe(false);
  });
});

describe('RedisService.delCacheByPrefix / withLock', () => {
  it('chỉ xoá key cache có đúng prefix', async () => {
    const store = new Set(['cache:news:a', 'cache:news:b', 'cache:banners:public', 'lock:news:publish']);
    const redis = withClient({
      scan: async (_c: string, _m: string, pattern: string) => {
        const re = new RegExp(`^${pattern.replace('*', '.*')}$`);
        return ['0', [...store].filter((k) => re.test(k))];
      },
      del: async (...keys: string[]) => keys.filter((k) => store.delete(k)).length,
    });
    expect(await redis.delCacheByPrefix('news:')).toBe(2);
    expect([...store]).toEqual(['cache:banners:public', 'lock:news:publish']);
  });

  it('withLock bỏ lượt khi không giành được lock và luôn nhả lock khi fn lỗi', async () => {
    const del = vi.fn(async () => 1);
    const busy = withClient({ set: async () => null, del });
    const fn = vi.fn(async () => 1);
    await expect(busy.withLock('lock:x', 10, fn)).resolves.toBeUndefined();
    expect(fn).not.toHaveBeenCalled();

    const free = withClient({ set: async () => 'OK', del });
    await expect(
      free.withLock('lock:x', 10, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(del).toHaveBeenCalledWith('lock:x');
  });
});
