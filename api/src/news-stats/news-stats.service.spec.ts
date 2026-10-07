import { NotFoundException } from '@nestjs/common';
import { NewsStatsService, vnDay } from './news-stats.service.js';

const config = { get: (key: string, fallback?: unknown) => (key === 'feUrl' ? 'https://mgo.remak.vn' : fallback) };
const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36';
const meta = { ip: '1.2.3.4', userAgent: BROWSER };
const NOW = new Date('2026-10-08T03:00:00Z'); // 10:00 giờ Việt Nam

/** $executeRaw là tagged template: (strings, ...values) — ghi lại values để kiểm tra */
function setup(opts: { visible?: boolean; seen?: boolean | null } = {}) {
  const calls: unknown[][] = [];
  const prisma = {
    newsPostTranslation: {
      findFirst: vi.fn(async () => (opts.visible === false ? null : { postId: 'p1' })),
      findMany: vi.fn(async () => [
        { postId: 'p1', locale: 'vi', slug: 'bai-1', title: 'Bài 1', post: { coverImageUrl: null } },
        { postId: 'p2', locale: 'vi', slug: 'bai-2', title: 'Bài 2', post: { coverImageUrl: '/c.jpg' } },
      ]),
    },
    newsPost: {
      findUnique: vi.fn(async () => ({ id: 'p1', viewCount: 120 })),
      findMany: vi.fn(async (args: { where: { id: { in: string[] } } }) =>
        args.where.id.in.map((id) => ({ id, viewCount: id === 'p2' ? 40 : 10 })),
      ),
    },
    newsPostDailyStat: {
      aggregate: vi.fn(async () => ({ _sum: { views: 120, reads: 30, readSeconds: BigInt(6000) } })),
      groupBy: vi.fn(async (args: { by: string[] }) => {
        if (args.by[0] === 'day') return [{ day: new Date('2026-10-08T00:00:00Z'), _sum: { views: 5, reads: 1 } }];
        if (args.by[0] === 'source') return [{ source: 'AI', _sum: { views: 3 } }, { source: 'SEARCH', _sum: { views: 9 } }];
        return [
          { postId: 'p2', _sum: { views: 40 } },
          { postId: 'gone', _sum: { views: 30 } }, // bài đã gỡ -> bị bỏ
          { postId: 'p1', _sum: { views: 10 } },
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
    cacheOrLoad: vi.fn(<T>(_k: string, _t: number, loader: () => Promise<T>) => loader()),
  };
  const service = new NewsStatsService(prisma as never, redis as never, config as never);
  return { service, prisma, redis, calls };
}

describe('vnDay', () => {
  it('ngày theo giờ Việt Nam (UTC+7)', () => {
    expect(vnDay(new Date('2026-10-07T18:30:00Z'))).toBe('2026-10-08'); // 01:30 sáng 8/10 ở VN
    expect(vnDay(new Date('2026-10-07T16:00:00Z'))).toBe('2026-10-07');
  });
});

describe('NewsStatsService.trackView', () => {
  it('đếm 1 lượt, đúng ngày VN và nguồn; trả tổng lượt xem', async () => {
    const { service, calls } = setup();
    const r = await service.trackView('p1', { locale: 'vi', referrer: 'https://www.google.com/' }, meta, NOW);
    expect(r).toEqual({ views: 120 });
    // values: postId, locale, day, source, views, reads, readSeconds | views, postId, views (UPDATE view_count)
    expect(calls[0]).toEqual(['p1', 'vi', '2026-10-08', 'SEARCH', 1, 0, 0, 1, 'p1', 1]);
  });

  it('utm_source=chatgpt.com -> nguồn AI', async () => {
    const { service, calls } = setup();
    await service.trackView('p1', { locale: 'vi', utm: 'chatgpt.com' }, meta, NOW);
    expect(calls[0][3]).toBe('AI');
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

  it('bot -> không đếm, không chạm Redis', async () => {
    const { service, prisma, redis } = setup();
    await service.trackView('p1', { locale: 'vi' }, { ip: '1.1.1.1', userAgent: 'Googlebot/2.1' }, NOW);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
    expect(redis.setIfAbsent).not.toHaveBeenCalled();
  });

  it('bài không hiển thị -> 404, không ghi', async () => {
    const { service, prisma } = setup({ visible: false });
    await expect(service.trackView('x', { locale: 'vi' }, meta, NOW)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('khoá chống trùng không chứa IP thô', async () => {
    const { service, redis } = setup();
    await service.trackView('p1', { locale: 'vi' }, meta, NOW);
    const key = (redis.setIfAbsent.mock.calls[0] as unknown as [string])[0];
    expect(key).toMatch(/^views:seen:[0-9a-f]{40}$/);
    expect(key).not.toContain('1.2.3.4');
  });
});

describe('NewsStatsService.trackRead', () => {
  it('đọc hết -> reads +1; số giây bị kẹp ≤ 30 phút', async () => {
    const { service, calls } = setup();
    await service.trackRead('p1', { locale: 'vi', seconds: 5000, completed: true }, meta, NOW);
    expect(calls[0].slice(4, 7)).toEqual([0, 1, 1800]);
  });

  it('beacon lặp lại -> chỉ ghi lần đầu', async () => {
    const { service, prisma } = setup({ seen: true });
    await service.trackRead('p1', { locale: 'vi', seconds: 30 }, meta, NOW);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});

describe('NewsStatsService.popular', () => {
  it('sắp theo lượt xem, bỏ bài không còn hiển thị, giới hạn số bài', async () => {
    const { service } = setup();
    const r = await service.popular('vi', 7, 5, NOW);
    expect(r.map((p) => [p.postId, p.views])).toEqual([
      ['p2', 40],
      ['p1', 10],
    ]);
    expect(r[0]).toMatchObject({ slug: 'bai-2', coverUrl: '/c.jpg' });
  });
});

describe('NewsStatsService.postStats', () => {
  it('đủ số ngày, tỉ lệ đọc hết, thời gian đọc, mọi nguồn sắp giảm dần', async () => {
    const { service } = setup();
    const s = await service.postStats('p1', 'vi', 7, NOW);
    expect(s.daily).toHaveLength(7);
    expect(s.daily.at(-1)).toEqual({ day: '2026-10-08', views: 5, reads: 1 });
    expect(s.daily[0]).toEqual({ day: '2026-10-02', views: 0, reads: 0 });
    expect(s.allTime).toEqual({ views: 120, reads: 30, readRate: 0.25, avgReadSeconds: 50 });
    expect(s.sources[0]).toEqual({ source: 'SEARCH', views: 9 });
    expect(s.sources).toHaveLength(6);
  });
});

describe('NewsStatsService.viewsForPosts', () => {
  it('có kỳ: tổng đọc cột view_count + 1 groupBy theo kỳ', async () => {
    const { service, prisma } = setup();
    const m = await service.viewsForPosts(['p1', 'p2'], 30, NOW);
    expect(prisma.newsPost.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.newsPostDailyStat.groupBy).toHaveBeenCalledTimes(1);
    expect(m.get('p2')).toEqual({ views: 40, viewsInPeriod: 40 });
  });

  it('không chọn kỳ: chỉ đọc cột view_count, không cộng bảng ngày', async () => {
    const { service, prisma } = setup();
    const m = await service.viewsForPosts(['p1', 'p2'], undefined, NOW);
    expect(prisma.newsPostDailyStat.groupBy).not.toHaveBeenCalled();
    expect(m.get('p1')).toEqual({ views: 10, viewsInPeriod: 10 });
  });
});
