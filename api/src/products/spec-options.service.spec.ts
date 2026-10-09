import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PRODUCTS_INVALIDATE } from './products.constants.js';
import { SpecOptionsService } from './spec-options.service.js';

const UPDATED = new Date('2026-10-01T00:00:00Z');

const optionRow = (id: string, group: string, code: string, sortOrder = 0) => ({
  id,
  group,
  code,
  sortOrder,
  isActive: true,
  updatedAt: UPDATED,
  translations: [
    { optionId: id, locale: 'vi', label: `Nhãn ${code}` },
    { optionId: id, locale: 'en', label: `Label ${code}` },
  ],
});

function setup(opts: { usage?: { grp: string; code: string; n: number }[]; codeTaken?: boolean; rows?: ReturnType<typeof optionRow>[] } = {}) {
  const rows = opts.rows ?? [optionRow('a', 'CRYSTAL_PHASE', 'PHASE_517', 0), optionRow('b', 'CRYSTAL_PHASE', 'PHASE_318', 1)];
  const tx = {
    specOption: { updateMany: vi.fn(async () => ({ count: 1 })) },
    specOptionTranslation: { deleteMany: vi.fn(async () => ({ count: 2 })), createMany: vi.fn(async () => ({ count: 2 })) },
  };
  const prisma = {
    specOption: {
      findMany: vi.fn(async (args?: { select?: unknown; where?: { group?: string } }) =>
        rows.filter((r) => !args?.where?.group || r.group === args.where.group).map((r) => (args?.select ? { id: r.id } : r)),
      ),
      findUnique: vi.fn(async (args: { where: { id: string } }) => rows.find((r) => r.id === args.where.id) ?? null),
      count: vi.fn(async () => (opts.codeTaken ? 1 : 0)),
      aggregate: vi.fn(async () => ({ _max: { sortOrder: 1 } })),
      create: vi.fn(async () => ({ id: 'a' })),
      delete: vi.fn(async () => ({ id: 'a' })),
    },
    $queryRaw: vi.fn(async () => opts.usage ?? []),
    $executeRaw: vi.fn(async () => 2),
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const cache = { invalidate: vi.fn(async () => undefined) };
  const service = new SpecOptionsService(prisma as never, cache as never);
  return { service, prisma, tx, cache };
}

describe('SpecOptionsService.list', () => {
  it('kèm số sản phẩm đang dùng từng mã (theo nhóm)', async () => {
    const { service } = setup({ usage: [{ grp: 'CRYSTAL_PHASE', code: 'PHASE_517', n: 4 }] });
    const list = await service.list();
    expect(list.map((o) => [o.code, o.usageCount, o.labels.vi])).toEqual([
      ['PHASE_517', 4, 'Nhãn PHASE_517'],
      ['PHASE_318', 0, 'Nhãn PHASE_318'],
    ]);
  });

  it('đếm sử dụng quét đủ 5 bảng / cột mảng và KHÔNG bỏ sản phẩm trong thùng rác', async () => {
    const { service, prisma } = setup();
    await service.list();
    const [strings] = prisma.$queryRaw.mock.calls[0] as unknown as [TemplateStringsArray];
    const sql = strings.join('?');
    for (const col of ['edge_profile', 'edge_profiles', 'core_color', 'surface_finish', 'screw_holding_rating', 'crystal_phase', 'voc_level', 'suitable_floorings', 'core_materials', 'load_bearing', 'finish_type', 'scratch_resistance']) {
      expect(sql).toContain(col);
    }
    expect(sql).not.toContain('deleted_at');
  });
});

describe('SpecOptionsService.create', () => {
  it('bỏ trống mã -> sinh từ nhãn tiếng Việt, xếp cuối nhóm, xoá cache', async () => {
    const { service, prisma, cache } = setup();
    await service.create({ group: 'CRYSTAL_PHASE', isActive: true, labels: { vi: 'Pha hỗn hợp', en: null } });
    expect(prisma.specOption.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ group: 'CRYSTAL_PHASE', code: 'PHA_HON_HOP', sortOrder: 2, translations: { create: [{ locale: 'vi', label: 'Pha hỗn hợp' }] } }),
    });
    expect(cache.invalidate).toHaveBeenCalledWith(PRODUCTS_INVALIDATE);
  });

  it('mã trùng trong cùng nhóm -> 409', async () => {
    const { service, prisma } = setup({ codeTaken: true });
    await expect(service.create({ group: 'VOC_LEVEL', code: 'STANDARD', isActive: true, labels: { vi: 'Tiêu chuẩn', en: null } })).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.specOption.count).toHaveBeenCalledWith({ where: { group: 'VOC_LEVEL', code: 'STANDARD' } });
    expect(prisma.specOption.create).not.toHaveBeenCalled();
  });
});

describe('SpecOptionsService.update', () => {
  it('đổi mã -> 400, không ghi', async () => {
    const { service, prisma } = setup();
    await expect(service.update('a', { code: 'PHASE_999', isActive: true, labels: { vi: 'x', en: null } }, UPDATED.toISOString())).rejects.toThrow('Không đổi được mã');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('sửa nhãn + bật/tắt, giữ mã, xoá cache', async () => {
    const { service, tx, cache } = setup();
    await service.update('a', { isActive: false, labels: { vi: 'Pha 517 mới', en: 'New 517' } }, UPDATED.toISOString());
    expect(tx.specOption.updateMany).toHaveBeenCalledWith({ where: { id: 'a', updatedAt: UPDATED }, data: { isActive: false } });
    expect(tx.specOptionTranslation.createMany).toHaveBeenCalledWith({
      data: [
        { optionId: 'a', locale: 'vi', label: 'Pha 517 mới' },
        { optionId: 'a', locale: 'en', label: 'New 517' },
      ],
    });
    expect(cache.invalidate).toHaveBeenCalledWith(PRODUCTS_INVALIDATE);
  });
});

describe('SpecOptionsService.remove', () => {
  it('đang dùng -> 409, không xoá', async () => {
    const { service, prisma } = setup({ usage: [{ grp: 'CRYSTAL_PHASE', code: 'PHASE_517', n: 3 }] });
    await expect(service.remove('a')).rejects.toThrow('Giá trị đang dùng ở 3 sản phẩm — tắt thay vì xoá');
    expect(prisma.specOption.delete).not.toHaveBeenCalled();
  });

  it('không ai dùng -> xoá', async () => {
    const { service, prisma } = setup();
    await expect(service.remove('a')).resolves.toEqual({ success: true });
    expect(prisma.specOption.delete).toHaveBeenCalledWith({ where: { id: 'a' } });
  });
});

describe('SpecOptionsService.reorder', () => {
  it('thiếu id của nhóm -> 409, không ghi', async () => {
    const { service, prisma } = setup();
    await expect(service.reorder('CRYSTAL_PHASE', ['a'])).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});

describe('SpecOptionsService — dùng cho sản phẩm', () => {
  it('codesByGroup gồm cả mã đang tắt', async () => {
    const off = { ...optionRow('c', 'VOC_LEVEL', 'LOW'), isActive: false };
    const { service } = setup({ rows: [optionRow('a', 'CRYSTAL_PHASE', 'PHASE_517'), off] });
    const codes = await service.codesByGroup();
    expect(codes.get('VOC_LEVEL')?.has('LOW')).toBe(true);
    expect(codes.get('CRYSTAL_PHASE')?.has('PHASE_517')).toBe(true);
  });

  it('labelsFor: nhãn theo ngôn ngữ, thiếu bản dịch dùng tiếng Việt, chỉ mã được dùng', async () => {
    const viOnly = { ...optionRow('c', 'VOC_LEVEL', 'LOW'), translations: [{ optionId: 'c', locale: 'vi', label: 'Thấp' }] };
    const { service } = setup({ rows: [optionRow('a', 'CRYSTAL_PHASE', 'PHASE_517'), viOnly] });
    const labels = await service.labelsFor('en', [
      { group: 'CRYSTAL_PHASE', code: 'PHASE_517' },
      { group: 'VOC_LEVEL', code: 'LOW' },
    ]);
    expect(labels).toEqual({ CRYSTAL_PHASE: { PHASE_517: 'Label PHASE_517' }, VOC_LEVEL: { LOW: 'Thấp' } });
  });
});
