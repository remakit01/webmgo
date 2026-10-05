import { NewsPublicService } from './news-public.service.js';
import { NewsSchedulerService } from './news-scheduler.service.js';
import { NEWS_INVALIDATE } from './news.constants.js';

const noCache = { cacheOrLoad: <T>(_k: string, _t: number, loader: () => Promise<T>) => loader() };

describe('NewsPublicService.bySlug', () => {
  it('slug sai định dạng -> null, không chạm DB', async () => {
    const prisma = { newsPostTranslation: { findFirst: vi.fn() } };
    const service = new NewsPublicService(prisma as never, noCache as never, {} as never);
    await expect(service.bySlug('vi', '../etc')).resolves.toBeNull();
    expect(prisma.newsPostTranslation.findFirst).not.toHaveBeenCalled();
  });

  it('slug cũ -> { redirect: slug hiện tại }', async () => {
    const findFirst = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ slug: 'toi-la-abc-moi' });
    const prisma = { newsPostTranslation: { findFirst } };
    const slugRedirects = { resolve: vi.fn(async () => 'p1') };
    const service = new NewsPublicService(prisma as never, noCache as never, slugRedirects as never);
    await expect(service.bySlug('vi', 'toi-la-abc')).resolves.toEqual({ redirect: 'toi-la-abc-moi' });
    expect(slugRedirects.resolve).toHaveBeenCalledWith('news_post', 'vi', 'toi-la-abc');
  });

  it('slug của ngôn ngữ khác (/en/news/<slug-vi>) -> redirect sang slug tiếng Anh', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce(null) // không có bài tiếng Anh nào mang slug này
      .mockResolvedValueOnce({ postId: 'p1' }) // slug thuộc bản tiếng Việt của p1
      .mockResolvedValueOnce({ slug: 'i-am-abc' }); // bản tiếng Anh đang hiển thị của p1
    const prisma = { newsPostTranslation: { findFirst } };
    const service = new NewsPublicService(prisma as never, noCache as never, { resolve: async () => null } as never);
    await expect(service.bySlug('en', 'toi-la-abc')).resolves.toEqual({ redirect: 'i-am-abc' });
  });

  it('không có bài, không có redirect -> null (404)', async () => {
    const prisma = { newsPostTranslation: { findFirst: vi.fn(async () => null) } };
    const service = new NewsPublicService(prisma as never, noCache as never, { resolve: async () => null } as never);
    await expect(service.bySlug('en', 'i-am-abc')).resolves.toBeNull();
  });
});

describe('NewsSchedulerService.publishDue', () => {
  it('đăng bản SCHEDULED tới giờ, giữ firstPublishedAt cũ và revalidate', async () => {
    const at = new Date('2026-10-05T00:00:00Z');
    const prisma = {
      newsPostTranslation: {
        findMany: vi.fn(async () => [{ postId: 'p1', locale: 'vi', publishedAt: at, firstPublishedAt: null }]),
        updateMany: vi.fn((args: unknown) => args),
      },
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    };
    const cache = { invalidate: vi.fn(async () => undefined) };
    const service = new NewsSchedulerService(prisma as never, cache as never);
    await expect(service.publishDue(new Date('2026-10-05T01:00:00Z'))).resolves.toBe(1);
    expect(prisma.newsPostTranslation.updateMany).toHaveBeenCalledWith({
      where: { postId: 'p1', locale: 'vi', status: 'SCHEDULED' },
      data: { status: 'PUBLISHED', firstPublishedAt: at },
    });
    expect(cache.invalidate).toHaveBeenCalledWith(NEWS_INVALIDATE);
  });

  it('không có bài tới giờ -> không revalidate', async () => {
    const prisma = { newsPostTranslation: { findMany: vi.fn(async () => []) } };
    const cache = { invalidate: vi.fn() };
    const service = new NewsSchedulerService(prisma as never, cache as never);
    await expect(service.publishDue()).resolves.toBe(0);
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
