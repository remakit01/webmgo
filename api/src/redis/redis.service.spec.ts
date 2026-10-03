import { RedisService } from './redis.service.js';

// Redis chết không được làm sập request (quy tắc #5): mọi lệnh lỗi -> giá trị "cache miss"
describe('RedisService khi Redis lỗi', () => {
  const config = { get: (_key: string, fallback?: unknown) => fallback } as never;

  function brokenRedis() {
    const service = new RedisService(config);
    const fail = vi.fn(async () => {
      throw new Error('Connection is closed.');
    });
    // Thay client thật bằng client luôn lỗi
    (service as unknown as { client: Record<string, unknown> }).client = { get: fail, set: fail, del: fail };
    return service;
  }

  it('get/getJson trả null, set/setJson/del không ném lỗi', async () => {
    const redis = brokenRedis();
    await expect(redis.get('k')).resolves.toBeNull();
    await expect(redis.getJson('k')).resolves.toBeNull();
    await expect(redis.set('k', 'v', 'EX', 60)).resolves.toBeUndefined();
    await expect(redis.setJson('k', { a: 1 }, 60)).resolves.toBeUndefined();
    await expect(redis.del('k')).resolves.toBeUndefined();
  });

  it('acquireLock trả false để job bỏ lượt thay vì chạy chồng', async () => {
    await expect(brokenRedis().acquireLock('lock', 60)).resolves.toBe(false);
  });

  it('getJson coi dữ liệu hỏng là cache miss', async () => {
    const redis = new RedisService(config);
    (redis as unknown as { client: Record<string, unknown> }).client = { get: async () => '{không phải json' };
    await expect(redis.getJson('k')).resolves.toBeNull();
  });
});

describe('RedisService cache namespace', () => {
  const config = { get: (_key: string, fallback?: unknown) => fallback } as never;

  it('getJson/setJson/delCache dùng tiền tố cache:, flushCache xoá đúng các key đó', async () => {
    const store = new Map<string, string>([['lock:banners:purge', '1']]);
    const client = {
      get: async (k: string) => store.get(k) ?? null,
      set: async (k: string, v: string) => void store.set(k, v),
      del: async (...keys: string[]) => keys.filter((k) => store.delete(k)).length,
      scan: async () => ['0', [...store.keys()].filter((k) => k.startsWith('cache:'))],
    };
    const redis = new RedisService(config);
    (redis as unknown as { client: typeof client }).client = client;

    await redis.setJson('banners:public', { a: 1 }, 60);
    await redis.setJson('homepage:hero:public', { b: 2 }, 60);
    expect(store.has('cache:banners:public')).toBe(true);
    expect(await redis.getJson('banners:public')).toEqual({ a: 1 });

    await redis.delCache('banners:public');
    expect(store.has('cache:banners:public')).toBe(false);

    expect(await redis.flushCache()).toBe(1);
    expect([...store.keys()]).toEqual(['lock:banners:purge']); // lock không bị đụng
  });
});
