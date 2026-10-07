import { BadRequestException, ConflictException } from '@nestjs/common';
import { richDocFromParagraphs } from '@remak/shared/rich-content';
import { NewsPostsService } from './news-posts.service.js';
import { NEWS_INVALIDATE } from './news.constants.js';

const T0 = new Date('2026-10-05T01:00:00.000Z');
const MINIO = 'http://localhost:9000/remak-mgo-assets/';

type Tr = Record<string, unknown> & { locale: string; status: string; updatedAt: Date; slug: string };

function translation(over: Partial<Tr> = {}): Tr {
  return {
    postId: 'p1',
    locale: 'vi',
    status: 'DRAFT',
    publishedAt: null,
    firstPublishedAt: null,
    title: 'Tôi là ABC',
    slug: 'toi-la-abc',
    sapo: 'Sapo',
    content: richDocFromParagraphs(['Nội dung']),
    contentText: 'Nội dung',
    coverAlt: 'Ảnh',
    origin: 'HUMAN',
    contentUpdatedAt: T0,
    sourceUpdatedAt: null,
    updatedAt: T0,
    ...over,
  };
}

function setup(opts: { translations?: Tr[]; cover?: string | null; slugTaken?: string[] } = {}) {
  const post = {
    id: 'p1',
    updatedAt: T0,
    coverImageUrl: opts.cover === undefined ? `${MINIO}news/covers/x/1920.webp` : opts.cover,
    coverImageKey: 'news/covers/x',
    translations: opts.translations ?? [translation()],
  };
  const updateMany = vi.fn(async () => ({ count: 1 }));
  const tx = {
    newsPostTranslation: { updateMany, create: vi.fn(async () => undefined) },
  };
  const prisma = {
    newsPost: {
      findFirst: vi.fn(async () => post),
      findUnique: vi.fn(async () => ({ ...post, tags: [], createdAt: T0, deletedAt: null, categoryId: 'c1', authorId: null, isFeatured: false, featuredOrder: null })),
    },
    newsPostTranslation: {
      updateMany,
      count: vi.fn(async ({ where }: { where: { slug: string } }) => ((opts.slugTaken ?? []).includes(where.slug) ? 1 : 0)),
    },
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const storage = { isOwnPublicUrl: (url: string, prefix: string) => url.startsWith(MINIO + prefix) };
  const cache = { invalidate: vi.fn(async () => undefined) };
  const slugRedirects = { record: vi.fn(async () => undefined), release: vi.fn(async () => undefined) };
  const service = new NewsPostsService(prisma as never, {} as never, storage as never, cache as never, slugRedirects as never, {
    viewsForPosts: async () => new Map(),
  } as never);
  return { service, prisma, cache, slugRedirects, updateMany, tx };
}

const dto = (over: Record<string, unknown> = {}) =>
  ({ title: 'Tôi là ABC', sapo: 'Sapo', content: richDocFromParagraphs(['Nội dung']), coverAlt: 'Ảnh', ...over }) as never;

describe('NewsPostsService.publish', () => {
  it('đăng ngay: PUBLISHED, ghi firstPublishedAt, xoá cache + revalidate', async () => {
    const { service, updateMany, cache } = setup();
    await service.publish('p1', 'vi', {}, T0.toISOString());
    const data = (updateMany.mock.calls[0] as unknown as [{ data: { status: string; firstPublishedAt: Date } }])[0].data;
    expect(data.status).toBe('PUBLISHED');
    expect(data.firstPublishedAt).toBeInstanceOf(Date);
    expect(cache.invalidate).toHaveBeenCalledWith(NEWS_INVALIDATE);
  });

  it('thời điểm tương lai -> SCHEDULED, chưa ghi firstPublishedAt', async () => {
    const { service, updateMany } = setup();
    await service.publish('p1', 'vi', { publishedAt: '2099-01-01T00:00:00.000Z' }, undefined);
    const data = (updateMany.mock.calls[0] as unknown as [{ data: { status: string; firstPublishedAt: Date | null } }])[0].data;
    expect(data.status).toBe('SCHEDULED');
    expect(data.firstPublishedAt).toBeNull();
  });

  it('thiếu ảnh đại diện / nội dung trống -> 400 liệt kê lý do', async () => {
    const { service } = setup({ cover: null, translations: [translation({ contentText: '' })] });
    await expect(service.publish('p1', 'vi', {}, undefined)).rejects.toThrow(/ảnh đại diện.*|nội dung đang trống/);
    await expect(service.publish('p1', 'vi', {}, undefined)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('không cho xuất bản bản tiếng Anh khi bản tiếng Việt chưa xuất bản', async () => {
    const { service } = setup({ translations: [translation(), translation({ locale: 'en', slug: 'i-am-abc' })] });
    await expect(service.publish('p1', 'en', {}, undefined)).rejects.toThrow('cần xuất bản bản tiếng Việt trước');
  });

  it('If-Match lệch phiên bản -> 409', async () => {
    const { service } = setup();
    await expect(service.publish('p1', 'vi', {}, '2020-01-01T00:00:00.000Z')).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('NewsPostsService.upsertTranslation', () => {
  it('bài đã từng đăng đổi slug -> ghi slug cũ để 301', async () => {
    const published = translation({ status: 'PUBLISHED', firstPublishedAt: T0, publishedAt: T0 });
    const { service, slugRedirects, cache } = setup({ translations: [published] });
    await service.upsertTranslation('p1', 'vi', dto({ slug: 'toi-la-abc-moi' }), undefined);
    expect(slugRedirects.record).toHaveBeenCalledWith('news_post', 'vi', 'toi-la-abc', 'toi-la-abc-moi', 'p1', expect.anything());
    expect(cache.invalidate).toHaveBeenCalled();
  });

  it('bài nháp đổi slug không tạo redirect và không revalidate', async () => {
    const { service, slugRedirects, cache } = setup();
    await service.upsertTranslation('p1', 'vi', dto({ slug: 'slug-khac' }), undefined);
    expect(slugRedirects.record).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('không gửi slug -> giữ slug cũ dù đổi tiêu đề', async () => {
    const { service, updateMany } = setup();
    await service.upsertTranslation('p1', 'vi', dto({ title: 'Tiêu đề mới hoàn toàn' }), undefined);
    const data = (updateMany.mock.calls[0] as unknown as [{ data: { slug: string } }])[0].data;
    expect(data.slug).toBe('toi-la-abc');
  });

  it('bản tiếng Anh mới: slug sinh từ tiêu đề tiếng Anh, tự thêm hậu tố khi trùng', async () => {
    const { service, tx } = setup({ slugTaken: ['i-am-abc'] });
    await service.upsertTranslation('p1', 'en', dto({ title: 'I am ABC' }), undefined);
    const data = (tx.newsPostTranslation.create.mock.calls[0] as unknown as [{ data: { slug: string; sourceUpdatedAt: Date } }])[0].data;
    expect(data.slug).toBe('i-am-abc-2');
    expect(data.sourceUpdatedAt).toEqual(T0); // dịch từ bản tiếng Việt hiện tại
  });

  it('slug tự nhập bị trùng -> 409 (không tự đổi)', async () => {
    const { service } = setup({ slugTaken: ['da-co'] });
    await expect(service.upsertTranslation('p1', 'vi', dto({ slug: 'da-co' }), undefined)).rejects.toBeInstanceOf(ConflictException);
  });

  it('ảnh trong nội dung phải nằm trên MinIO của hệ thống', async () => {
    const { service } = setup();
    const content = { type: 'doc', content: [{ type: 'image', attrs: { src: 'https://evil.com/x.png', alt: 'x' } }] };
    await expect(service.upsertTranslation('p1', 'vi', dto({ content }), undefined)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lưu lại bản AI không gửi origin -> AI_REVIEWED; nội dung không đổi -> giữ contentUpdatedAt', async () => {
    const { service, updateMany } = setup({ translations: [translation({ origin: 'AI' })] });
    await service.upsertTranslation('p1', 'vi', dto(), undefined);
    const data = (updateMany.mock.calls[0] as unknown as [{ data: Record<string, unknown> }])[0].data;
    expect(data.origin).toBe('AI_REVIEWED');
    expect(data).not.toHaveProperty('contentUpdatedAt');
  });
});

describe('NewsPostsService.list — sắp theo lượt xem', () => {
  const row = (id: string) => ({
    id,
    categoryId: 'c1',
    coverImageUrl: null,
    isFeatured: false,
    updatedAt: new Date('2026-10-01T00:00:00Z'),
    deletedAt: null,
    category: { translations: [{ name: 'Kỹ thuật' }] },
    translations: [],
  });
  function setup(viewsInPeriod: Record<string, number>) {
    const findMany = vi.fn(async (args: { select: Record<string, unknown>; where?: { id?: { in: string[] } } }) =>
      // Lần 1: chỉ lấy id theo mới cập nhật; lần 2: chi tiết các bài của trang
      args.where?.id ? args.where.id.in.map(row) : ['a', 'b', 'c', 'd'].map((id) => ({ id })),
    );
    const stats = {
      sinceDay: () => new Date('2026-09-09T00:00:00Z'),
      viewsForPosts: vi.fn(async (ids: string[]) => new Map(ids.map((id) => [id, { views: 100, viewsInPeriod: viewsInPeriod[id] ?? 0 }]))),
    };
    const prisma = { newsPost: { findMany, count: vi.fn() } };
    const service = new NewsPostsService(prisma as never, {} as never, {} as never, {} as never, {} as never, stats as never);
    return { service, findMany, stats };
  }

  it('xem nhiều nhất trong kỳ lên đầu, cùng lượt xem giữ thứ tự mới cập nhật, phân trang đúng', async () => {
    const { service, stats } = setup({ b: 50, c: 50, d: 7 });
    const r = await service.list({ sort: 'views_desc', viewsDays: 30, page: 1, pageSize: 3 });
    expect(r.items.map((i) => i.id)).toEqual(['b', 'c', 'd']);
    expect(r.total).toBe(4);
    expect(r.items[0]).toMatchObject({ views: 100, viewsInPeriod: 50 });
    expect(stats.viewsForPosts).toHaveBeenCalledWith(['a', 'b', 'c', 'd'], 30);
    const p2 = await service.list({ sort: 'views_desc', viewsDays: 30, page: 2, pageSize: 3 });
    expect(p2.items.map((i) => i.id)).toEqual(['a']);
  });

  it('xem ít nhất trong kỳ: bài chưa có lượt xem lên đầu', async () => {
    const { service } = setup({ a: 9, b: 1 });
    const r = await service.list({ sort: 'views_asc', viewsDays: 7, page: 1, pageSize: 4 });
    expect(r.items.map((i) => i.id)).toEqual(['c', 'd', 'b', 'a']);
  });

  it('mọi thời gian: ORDER BY view_count trong DB, phân trang bằng skip/take (không đọc id mọi bài)', async () => {
    const { service, findMany, stats } = setup({});
    findMany.mockImplementationOnce((async () => [row('a')]) as never);
    (service as unknown as { prisma: { newsPost: { count: () => Promise<number> } } }).prisma.newsPost.count = async () => 1;
    await service.list({ sort: 'views_desc', page: 2, pageSize: 3 });
    const args = (findMany.mock.calls[0] as unknown as [{ orderBy: unknown; skip: number; take: number }])[0];
    expect(args.orderBy).toEqual([{ viewCount: 'desc' }, { updatedAt: 'desc' }]);
    expect(args).toMatchObject({ skip: 3, take: 3 });
    expect(stats.viewsForPosts).toHaveBeenCalledWith(['a'], undefined);
  });
});

describe('NewsPostsService.list — lọc ngày cập nhật theo giờ Việt Nam', () => {
  it('07/10 = [06/10 17:00Z, 07/10 17:00Z) — không mất bài sửa lúc 0h–7h sáng giờ VN', async () => {
    const findMany = vi.fn(async () => []);
    const prisma = { newsPost: { findMany, count: vi.fn(async () => 0) } };
    const stats = { viewsForPosts: vi.fn(async () => new Map()), sinceDay: vi.fn() };
    const service = new NewsPostsService(prisma as never, {} as never, {} as never, {} as never, {} as never, stats as never);
    await service.list({ fromDate: '2026-10-07', toDate: '2026-10-07' });
    const where = (findMany.mock.calls[0] as unknown as [{ where: { AND: Record<string, unknown>[] } }])[0].where;
    const range = where.AND.find((c) => 'updatedAt' in c)!.updatedAt as { gte: Date; lt: Date };
    expect(range.gte.toISOString()).toBe('2026-10-06T17:00:00.000Z');
    expect(range.lt.toISOString()).toBe('2026-10-07T17:00:00.000Z');
  });
});
