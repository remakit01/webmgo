import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import { ReorderNewsCategoriesDto } from './dto/news-taxonomy.dto.js';
import { NEWS_INVALIDATE } from './news.constants.js';
import { NewsTaxonomyService } from './news-taxonomy.service.js';

const category = (id: string, sortOrder: number) => ({
  id,
  color: 'green',
  sortOrder,
  isActive: true,
  updatedAt: new Date('2026-10-01T00:00:00Z'),
  translations: [{ locale: 'vi', name: id, slug: id, description: null, seoTitle: null, seoDescription: null }],
  _count: { posts: 3 },
});

function setup(ids = ['a', 'b', 'c']) {
  const prisma = {
    newsCategory: {
      findMany: vi.fn(async (args?: { select?: unknown }) =>
        args?.select ? ids.map((id) => ({ id })) : ids.map((id, i) => category(id, i)),
      ),
    },
    newsPost: { groupBy: vi.fn(async () => [{ categoryId: 'b', _count: { _all: 2 } }]) },
    $executeRaw: vi.fn(async () => ids.length),
  };
  const cache = { invalidate: vi.fn(async () => undefined) };
  const service = new NewsTaxonomyService(prisma as never, cache as never);
  return { service, prisma, cache };
}

describe('NewsTaxonomyService.listCategories', () => {
  it('kèm số bài trong thùng rác (chặn xoá chuyên mục)', async () => {
    const { service } = setup();
    const rows = await service.listCategories();
    expect(rows.map((r) => [r.id, r.postCount, r.trashedPostCount])).toEqual([
      ['a', 3, 0],
      ['b', 3, 2],
      ['c', 3, 0],
    ]);
  });
});

describe('NewsTaxonomyService.reorderCategories', () => {
  it('một lệnh SQL theo đúng thứ tự gửi lên, không qua updateMany (không đổi updated_at), xoá cache', async () => {
    const { service, prisma, cache } = setup();
    await service.reorderCategories(['c', 'a', 'b']);
    const [strings, ids] = prisma.$executeRaw.mock.calls[0] as unknown as [TemplateStringsArray, string[]];
    expect(strings.join('?')).toContain('SET sort_order = o.ord - 1');
    expect(strings.join('?')).not.toContain('updated_at');
    expect(ids).toEqual(['c', 'a', 'b']);
    expect(cache.invalidate).toHaveBeenCalledWith(NEWS_INVALIDATE);
  });

  it('thiếu / thừa / lạ id -> 409, không ghi gì', async () => {
    const { service, prisma } = setup();
    await expect(service.reorderCategories(['a', 'b'])).rejects.toBeInstanceOf(ConflictException);
    await expect(service.reorderCategories(['a', 'b', 'x'])).rejects.toBeInstanceOf(ConflictException);
    await expect(service.reorderCategories(['a', 'b', 'c', 'd'])).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});

describe('ReorderNewsCategoriesDto', () => {
  const errors = async (body: unknown) => (await validate(plainToInstance(ReorderNewsCategoriesDto, body))).map((e) => e.property);

  it('hợp lệ', async () => {
    expect(await errors({ ids: ['a', 'b'] })).toEqual([]);
  });

  it('trùng / rỗng / không phải chuỗi -> lỗi', async () => {
    expect(await errors({ ids: ['a', 'a'] })).toEqual(['ids']);
    expect(await errors({ ids: [] })).toEqual(['ids']);
    expect(await errors({ ids: [1, 2] })).toEqual(['ids']);
  });
});

describe('NewsTaxonomyService — tag', () => {
  function setupTags() {
    const tagRow = (id: string) => ({ id, updatedAt: new Date('2026-10-01T00:00:00Z'), translations: [], _count: { posts: 0 } });
    const prisma = {
      newsTag: {
        findMany: vi.fn(async () => [tagRow('t1')]),
        count: vi.fn(async (args?: { where?: unknown }) => (args?.where ? 2 : 9)),
        deleteMany: vi.fn(async () => ({ count: 2 })),
      },
      $queryRaw: vi.fn(async () => [{ tag_id: 't1' }, { tag_id: 't2' }]),
    };
    const cache = { invalidate: vi.fn(async () => undefined) };
    return { service: new NewsTaxonomyService(prisma as never, cache as never), prisma, cache };
  }
  const findArgs = (prisma: ReturnType<typeof setupTags>['prisma']) =>
    (prisma.newsTag.findMany.mock.calls[0] as unknown as [{ where?: { AND: unknown[] }; orderBy: unknown; take: number }])[0];

  it('không truyền gì: như cũ — 200 tag mới tạo, không lọc', async () => {
    const { service, prisma } = setupTags();
    await service.listTags();
    const args = findArgs(prisma);
    expect(args.where).toBeUndefined();
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(args.take).toBe(200);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('tìm không phân biệt dấu (search_normalize) + lọc chưa dùng + sắp dùng nhiều', async () => {
    const { service, prisma } = setupTags();
    await service.listTags({ q: 'chong chay', filter: 'unused', sort: 'usage' });
    const [strings, pattern] = prisma.$queryRaw.mock.calls[0] as unknown as [TemplateStringsArray, string];
    expect(strings.join('?')).toContain("public.search_normalize(name) LIKE public.search_normalize(?) ESCAPE '\\'");
    expect(pattern).toBe('%chong chay%');
    const args = findArgs(prisma);
    expect(args.where?.AND).toEqual([{ id: { in: ['t1', 't2'] } }, { posts: { none: {} } }]);
    expect(args.orderBy).toEqual([{ posts: { _count: 'desc' } }, { id: 'desc' }]);
  });

  it('lọc chưa dịch tiếng Anh', async () => {
    const { service, prisma } = setupTags();
    await service.listTags({ filter: 'missing_en' });
    expect(findArgs(prisma).where?.AND).toEqual([{ translations: { none: { locale: 'en' } } }]);
  });

  it('thống kê cho nút lọc', async () => {
    const { service } = setupTags();
    expect(await service.tagStats()).toEqual({ total: 9, missingEn: 2, unused: 2 });
  });

  it('xoá hàng loạt một lệnh + xoá cache', async () => {
    const { service, prisma, cache } = setupTags();
    expect(await service.bulkDeleteTags(['a', 'b'])).toEqual({ deleted: 2 });
    expect(prisma.newsTag.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['a', 'b'] } } });
    expect(cache.invalidate).toHaveBeenCalledWith(NEWS_INVALIDATE);
  });
});
