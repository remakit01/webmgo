import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PRODUCTS_INVALIDATE, PRODUCT_TYPE_SLUG_ENTITY } from './products.constants.js';
import { ProductTypesService } from './product-types.service.js';
import type { UpsertProductTypeDto } from './dto/product-type.dto.js';

const UPDATED = new Date('2026-10-01T00:00:00Z');

const typeRow = (id: string, sortOrder: number, slugVi = id) => ({
  id,
  specProfile: 'NONE',
  sortOrder,
  isActive: true,
  updatedAt: UPDATED,
  translations: [{ typeId: id, locale: 'vi', name: id, slug: slugVi, description: null, seoTitle: null, seoDescription: null }],
  _count: { products: 1 },
});

function setup(opts: { ids?: string[]; productCount?: number; slugTaken?: boolean } = {}) {
  const ids = opts.ids ?? ['a', 'b'];
  const tx = {
    productType: { updateMany: vi.fn(async () => ({ count: 1 })) },
    productTypeTranslation: { deleteMany: vi.fn(async () => ({ count: 1 })), createMany: vi.fn(async () => ({ count: 1 })) },
  };
  const prisma = {
    productType: {
      findMany: vi.fn(async (args?: { select?: unknown }) => (args?.select ? ids.map((id) => ({ id })) : ids.map((id, i) => typeRow(id, i)))),
      findUnique: vi.fn(async () => typeRow('a', 0, 'tam-san-mgo')),
      aggregate: vi.fn(async () => ({ _max: { sortOrder: ids.length - 1 } })),
      create: vi.fn(async () => ({ id: 'a' })),
      delete: vi.fn(async () => ({ id: 'a' })),
    },
    productTypeTranslation: { count: vi.fn(async () => (opts.slugTaken ? 1 : 0)) },
    product: {
      count: vi.fn(async () => opts.productCount ?? 0),
      groupBy: vi.fn(async () => []),
    },
    $executeRaw: vi.fn(async () => ids.length),
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const cache = { invalidate: vi.fn(async () => undefined) };
  const slugRedirects = { record: vi.fn(async () => undefined), release: vi.fn(async () => undefined), removeFor: vi.fn(async () => undefined) };
  const service = new ProductTypesService(prisma as never, cache as never, slugRedirects as never);
  return { service, prisma, tx, cache, slugRedirects };
}

const dto = (slugVi?: string): UpsertProductTypeDto =>
  ({
    specProfile: 'FLOOR',
    isActive: true,
    translations: { vi: { name: 'Tấm sàn MgO cao cấp', slug: slugVi, description: null, seoTitle: null, seoDescription: null }, en: null },
  }) as UpsertProductTypeDto;

describe('ProductTypesService.remove', () => {
  it('còn sản phẩm (kể cả thùng rác) -> 409, không xoá', async () => {
    const { service, prisma } = setup({ productCount: 2 });
    await expect(service.remove('a')).rejects.toThrow('Loại còn 2 sản phẩm (kể cả trong thùng rác) — hãy chuyển sang loại khác trước');
    expect(prisma.product.count).toHaveBeenCalledWith({ where: { typeId: 'a' } });
    expect(prisma.productType.delete).not.toHaveBeenCalled();
  });

  it('loại trống -> xoá, bỏ redirect slug cũ, xoá cache', async () => {
    const { service, prisma, slugRedirects, cache } = setup();
    await expect(service.remove('a')).resolves.toEqual({ success: true });
    expect(prisma.productType.delete).toHaveBeenCalledWith({ where: { id: 'a' } });
    expect(slugRedirects.removeFor).toHaveBeenCalledWith(PRODUCT_TYPE_SLUG_ENTITY, 'a');
    expect(cache.invalidate).toHaveBeenCalledWith(PRODUCTS_INVALIDATE);
  });
});

describe('ProductTypesService.update — đổi slug', () => {
  it('slug vi đổi -> ghi redirect slug cũ trong cùng transaction', async () => {
    const { service, tx, slugRedirects } = setup();
    await service.update('a', dto('tam-san-mgo-cao-cap'), UPDATED.toISOString());
    expect(slugRedirects.record).toHaveBeenCalledWith(PRODUCT_TYPE_SLUG_ENTITY, 'vi', 'tam-san-mgo', 'tam-san-mgo-cao-cap', 'a', tx);
    expect(slugRedirects.release).toHaveBeenCalledWith(PRODUCT_TYPE_SLUG_ENTITY, 'vi', 'tam-san-mgo-cao-cap', tx);
  });

  it('giữ nguyên slug -> không ghi redirect', async () => {
    const { service, slugRedirects } = setup();
    await service.update('a', dto('tam-san-mgo'), UPDATED.toISOString());
    expect(slugRedirects.record).not.toHaveBeenCalled();
  });
});

describe('ProductTypesService.create', () => {
  it('slug tự nhập đã có -> 409', async () => {
    const { service, prisma } = setup({ slugTaken: true });
    await expect(service.create(dto('tam-san-mgo'))).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.productType.create).not.toHaveBeenCalled();
  });
});

describe('ProductTypesService.reorder', () => {
  it('lệch danh sách -> 409, không ghi', async () => {
    const { service, prisma } = setup({ ids: ['a', 'b'] });
    await expect(service.reorder(['a'])).rejects.toThrow('Danh sách loại vừa thay đổi — tải lại trang rồi sắp lại');
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});

describe('ProductTypesService.list', () => {
  it('kèm số sản phẩm trong thùng rác', async () => {
    const { service, prisma } = setup();
    prisma.product.groupBy.mockResolvedValueOnce([{ typeId: 'b', _count: { _all: 3 } }] as never);
    const rows = await service.list();
    expect(rows.map((r) => [r.id, r.productCount, r.trashedProductCount])).toEqual([
      ['a', 1, 0],
      ['b', 1, 3],
    ]);
  });
});
