import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { emptyProductInput, emptyVariantInput } from '@remak/shared/contracts/product';
import { ProductsService } from './products.service.js';
import { ProductsPublicService } from './products-public.service.js';
import { PRODUCTS_INVALIDATE } from './products.constants.js';
import type { ProductInputDto } from './dto/product-input.dto.js';

const noCache = { cacheOrLoad: <T>(_k: string, _t: number, loader: () => Promise<T>) => loader() };

/** Form hợp lệ tối thiểu: tên tiếng Việt + 1 độ dày */
const validInput = (): ProductInputDto => {
  const p = emptyProductInput('STANDARD');
  p.translations.vi.name = 'Tấm chống cháy';
  p.translations.vi.slug = 'tam-chong-chay-moi';
  p.translations.vi.summary = 'Tóm tắt';
  p.translations.vi.status = 'PUBLISHED';
  p.variants = [{ ...emptyVariantInput(8), isDefault: true }];
  return p as ProductInputDto;
};

/** Transaction giả: mọi model trả về đủ cho luồng ghi */
const fakeTx = () => {
  const model = () => ({
    create: vi.fn(async () => ({ id: 'new' })),
    update: vi.fn(async (a: { where: { id: string } }) => ({ id: a.where.id })),
    updateMany: vi.fn(async () => ({ count: 1 })),
    upsert: vi.fn(async () => ({})),
    delete: vi.fn(async () => ({})),
    deleteMany: vi.fn(async () => ({ count: 0 })),
    createMany: vi.fn(async () => ({ count: 0 })),
    findMany: vi.fn(async () => []),
    count: vi.fn(async () => 0),
  });
  return {
    product: model(),
    productTranslation: model(),
    productTechnicalSpec: model(),
    productVariant: model(),
    productVariantTranslation: model(),
    sipPanelSpec: model(),
    floorBoardSpec: model(),
    decorativeFinishSpec: model(),
    decorativeFinishOption: model(),
    $executeRaw: vi.fn(async () => 0),
  };
};

const setup = (existing: object | null = null) => {
  const tx = fakeTx();
  const prisma = {
    product: {
      findFirst: vi.fn(async () => existing),
      updateMany: vi.fn(async () => ({ count: 1 })),
      findMany: vi.fn(async () => []),
      aggregate: vi.fn(async () => ({ _max: { sortOrder: 4 } })),
    },
    $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    $executeRaw: vi.fn(async () => 0),
  };
  const cache = { invalidate: vi.fn(async () => undefined) };
  const slugRedirects = { release: vi.fn(async () => undefined), record: vi.fn(async () => undefined) };
  const service = new ProductsService(prisma as never, cache as never, {} as never, slugRedirects as never);
  // Đọc lại sau khi ghi: không kiểm ở đây
  vi.spyOn(service, 'get').mockResolvedValue({} as never);
  return { service, prisma, tx, cache, slugRedirects };
};

describe('ProductsService — ghi', () => {
  it('form sai -> 400 kèm errors theo field, không chạm DB', async () => {
    const { service, prisma } = setup();
    const err = await service.create(emptyProductInput() as ProductInputDto).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BadRequestException);
    expect((err as BadRequestException).getResponse()).toMatchObject({ errors: { 'translations.vi.name': expect.any(String) } });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('tạo mới: xếp cuối danh sách, ghi bản dịch + độ dày, xoá cache', async () => {
    const { service, tx, cache } = setup();
    await service.create(validInput());
    expect(tx.product.create).toHaveBeenCalledWith({ data: expect.objectContaining({ sortOrder: 5 }) });
    expect(tx.productTranslation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ locale: 'vi', slug: 'tam-chong-chay-moi', status: 'PUBLISHED' }) }),
    );
    expect(tx.productVariant.create).toHaveBeenCalledTimes(1);
    expect(cache.invalidate).toHaveBeenCalledWith(PRODUCTS_INVALIDATE);
  });

  it('If-Match cũ -> 409, không ghi', async () => {
    const { service, prisma } = setup({ id: 'p1', updatedAt: new Date('2026-10-08T00:00:00Z'), translations: [] });
    await expect(service.update('p1', validInput(), '2026-10-01T00:00:00.000Z')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('đổi slug của bản đã xuất bản -> ghi redirect 301 từ slug cũ', async () => {
    const updatedAt = new Date('2026-10-08T00:00:00Z');
    const old = { locale: 'vi', slug: 'tam-cu', status: 'PUBLISHED', publishedAt: updatedAt };
    const { service, slugRedirects } = setup({ id: 'p1', updatedAt, translations: [old] });
    await service.update('p1', validInput(), updatedAt.toISOString());
    expect(slugRedirects.record).toHaveBeenCalledWith('product', 'vi', 'tam-cu', 'tam-chong-chay-moi', 'p1', expect.anything());
  });

  it('bản nháp đổi slug -> không ghi redirect', async () => {
    const updatedAt = new Date('2026-10-08T00:00:00Z');
    const old = { locale: 'vi', slug: 'tam-cu', status: 'DRAFT', publishedAt: null };
    const { service, slugRedirects } = setup({ id: 'p1', updatedAt, translations: [old] });
    await service.update('p1', validInput(), updatedAt.toISOString());
    expect(slugRedirects.record).not.toHaveBeenCalled();
  });

  it('độ dày: giữ dòng theo id, xoá dòng không còn trong form', async () => {
    const updatedAt = new Date('2026-10-08T00:00:00Z');
    const { service, tx } = setup({ id: 'p1', updatedAt, translations: [] });
    tx.productVariant.findMany.mockResolvedValue([{ id: 'v1' }, { id: 'v2' }] as never);
    const input = validInput();
    input.variants = [{ ...emptyVariantInput(12), id: 'v2', isDefault: true }];
    await service.update('p1', input, undefined);
    expect(tx.productVariant.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1', id: { notIn: ['v2'] } } });
    expect(tx.productVariant.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'v2' } }));
    expect(tx.productVariant.create).not.toHaveBeenCalled();
  });

  it('sắp thứ tự với danh sách lệch -> 409', async () => {
    const { service, prisma } = setup();
    prisma.product.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }] as never);
    await expect(service.reorder(['a'])).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('xoá sản phẩm không tồn tại -> 404', async () => {
    const { service, prisma } = setup();
    prisma.product.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.remove('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('ProductsPublicService.bySlug', () => {
  it('slug sai định dạng -> null, không chạm DB', async () => {
    const prisma = { product: { findFirst: vi.fn() } };
    const service = new ProductsPublicService(prisma as never, noCache as never, {} as never);
    await expect(service.bySlug('../etc', 'vi')).resolves.toBeNull();
    expect(prisma.product.findFirst).not.toHaveBeenCalled();
  });

  it('slug cũ -> { redirect: slug hiện tại }', async () => {
    const prisma = {
      product: { findFirst: vi.fn(async () => null) },
      productTranslation: { findFirst: vi.fn(async () => ({ slug: 'tam-moi' })) },
    };
    const slugRedirects = { resolve: vi.fn(async () => 'p1') };
    const service = new ProductsPublicService(prisma as never, noCache as never, slugRedirects as never);
    await expect(service.bySlug('tam-cu', 'vi')).resolves.toEqual({ redirect: 'tam-moi' });
    expect(slugRedirects.resolve).toHaveBeenCalledWith('product', 'vi', 'tam-cu');
  });

  it('/en/products/<slug-vi> -> redirect sang slug tiếng Anh', async () => {
    const findFirst = vi.fn().mockResolvedValueOnce({ productId: 'p1' }).mockResolvedValueOnce({ slug: 'mgo-board' });
    const prisma = { product: { findFirst: vi.fn(async () => null) }, productTranslation: { findFirst } };
    const service = new ProductsPublicService(prisma as never, noCache as never, { resolve: async () => null } as never);
    await expect(service.bySlug('tam-mgo', 'en')).resolves.toEqual({ redirect: 'mgo-board' });
  });

  it('không có sản phẩm, không có redirect -> null (404)', async () => {
    const prisma = { product: { findFirst: vi.fn(async () => null) }, productTranslation: { findFirst: vi.fn(async () => null) } };
    const service = new ProductsPublicService(prisma as never, noCache as never, { resolve: async () => null } as never);
    await expect(service.bySlug('khong-co', 'vi')).resolves.toBeNull();
  });
});
