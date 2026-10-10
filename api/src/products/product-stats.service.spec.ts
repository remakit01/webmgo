import { NotFoundException } from '@nestjs/common';
import { ProductStatsService } from './product-stats.service.js';

const config = { get: (key: string, fallback?: unknown) => (key === 'feUrl' ? 'https://mgo.remak.vn' : fallback) };
const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36';
const meta = { ip: '1.2.3.4', userAgent: BROWSER };
const NOW = new Date('2026-10-07T18:30:00Z'); // 01:30 sáng 8/10 giờ Việt Nam

/** $executeRaw là tagged template: (strings, ...values) — ghi lại values để kiểm tra */
function setup(opts: { visible?: boolean; seen?: boolean | null } = {}) {
  const calls: unknown[][] = [];
  const prisma = {
    productTranslation: {
      findFirst: vi.fn(async () => (opts.visible === false ? null : { productId: 'p1' })),
      findMany: vi.fn(async () => [
        { productId: 'p1', locale: 'vi', name: 'Tấm 1', product: { coverImageUrl: null } },
        { productId: 'p2', locale: 'en', name: 'Board 2', product: { coverImageUrl: '/c.jpg' } },
      ]),
    },
    productDailyStat: {
      aggregate: vi.fn(async () => ({ _sum: { views: 80 } })),
      groupBy: vi.fn(async (args: { by: string[] }) => {
        if (args.by[0] === 'day') return [{ day: new Date('2026-10-08T00:00:00Z'), _sum: { views: 5 } }];
        if (args.by[0] === 'source') return [{ source: 'AI', _sum: { views: 3 } }, { source: 'SEARCH', _sum: { views: 9 } }];
        if (args.by.length === 1) return [{ productId: 'p1', _sum: { views: 7 } }];
        return [
          { productId: 'p2', locale: 'en', _sum: { views: 40 } },
          { productId: 'gone', locale: 'vi', _sum: { views: 30 } }, // sản phẩm đã xoá -> bị bỏ
          { productId: 'p1', locale: 'vi', _sum: { views: 10 } },
        ];
      }),
    },
    $executeRaw: vi.fn(async (...args: unknown[]) => {
      calls.push(args.slice(1));
      return 1;
    }),
  };
  const redis = {
    setIfAbsent: vi.fn(async () => (opts.seen === undefined ? true : opts.seen === null ? null : !opts.seen)),
  };
  const service = new ProductStatsService(prisma as never, redis as never, config as never);
  return { service, prisma, redis, calls };
}

describe('ProductStatsService.trackView', () => {
  it('đếm 1 lượt, đúng ngày VN và nguồn', async () => {
    const { service, calls, redis } = setup();
    await service.trackView('p1', { locale: 'vi', referrer: 'https://www.google.com/' }, meta, NOW);
    // values: productId, locale, day, source | productId (UPDATE view_count)
    expect(calls[0]).toEqual(['p1', 'vi', '2026-10-08', 'SEARCH', 'p1']);
    expect(redis.setIfAbsent).toHaveBeenCalledWith(expect.stringMatching(/^views:product:[0-9a-f]{40}$/), 1800);
  });

  it('xem lại trong 30 phút -> không đếm', async () => {
    const { service, prisma } = setup({ seen: true });
    await service.trackView('p1', { locale: 'vi' }, meta, NOW);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('Redis lỗi -> vẫn đếm', async () => {
    const { service, prisma } = setup({ seen: null });
    await service.trackView('p1', { locale: 'vi' }, meta, NOW);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('bot -> bỏ qua, không chạm DB / Redis', async () => {
    const { service, prisma, redis } = setup();
    await service.trackView('p1', { locale: 'vi' }, { ip: '1.2.3.4', userAgent: 'Googlebot/2.1' }, NOW);
    expect(prisma.productTranslation.findFirst).not.toHaveBeenCalled();
    expect(redis.setIfAbsent).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('id lạ / bản nháp -> 404, không ghi', async () => {
    const { service, prisma, redis } = setup({ visible: false });
    await expect(service.trackView('x', { locale: 'en' }, meta, NOW)).rejects.toBeInstanceOf(NotFoundException);
    expect(redis.setIfAbsent).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});

describe('ProductStatsService — thống kê CMS', () => {
  it('recentViews: danh sách rỗng -> không truy vấn', async () => {
    const { service, prisma } = setup();
    expect(await service.recentViews([], 30, NOW)).toEqual(new Map());
    expect(prisma.productDailyStat.groupBy).not.toHaveBeenCalled();
  });

  it('recentViews: 1 truy vấn cho cả danh sách', async () => {
    const { service, prisma } = setup();
    const map = await service.recentViews(['p1', 'p2'], 30, NOW);
    expect(map).toEqual(new Map([['p1', 7]]));
    expect(prisma.productDailyStat.groupBy).toHaveBeenCalledTimes(1);
  });

  it('overview: đủ ngày, mọi nguồn, top bỏ sản phẩm đã xoá', async () => {
    const { service } = setup();
    const r = await service.overview(7, NOW);
    expect(r).toMatchObject({ days: 7, views: 80, previousViews: 80 });
    expect(r.daily).toHaveLength(7);
    expect(r.daily.at(-1)).toEqual({ day: '2026-10-08', views: 5 });
    expect(r.daily[0]).toEqual({ day: '2026-10-02', views: 0 });
    expect(r.sources[0]).toEqual({ source: 'SEARCH', views: 9 });
    expect(r.sources.find((s) => s.source === 'DIRECT')).toEqual({ source: 'DIRECT', views: 0 });
    expect(r.topProducts).toEqual([
      { productId: 'p2', locale: 'en', name: 'Board 2', coverUrl: '/c.jpg', views: 40 },
      { productId: 'p1', locale: 'vi', name: 'Tấm 1', coverUrl: null, views: 10 },
    ]);
  });
});
