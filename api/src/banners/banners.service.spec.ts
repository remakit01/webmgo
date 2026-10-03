import { BadRequestException, ConflictException } from '@nestjs/common';
import { BannersService } from './banners.service.js';
import { MediaService } from '../storage/media.service.js';

function setup(existingIds: string[]) {
  const update = vi.fn((args: unknown) => args);
  const prisma = {
    banner: {
      count: vi.fn(async ({ where }: { where: { id: { in: string[] } } }) =>
        where.id.in.filter((id) => existingIds.includes(id)).length,
      ),
      update,
      findMany: vi.fn(async () => []),
    },
    $transaction: vi.fn(async (ops: unknown[]) => ops),
  };
  const redis = { del: vi.fn(), delCache: vi.fn(), get: vi.fn(), set: vi.fn() };
  const revalidate = { trigger: vi.fn() };
  const service = new BannersService(prisma as never, redis as never, {} as never, revalidate as never);
  return { service, prisma, redis, revalidate };
}

describe('BannersService.reorder', () => {
  it('gán sortOrder theo thứ tự, xoá cache và revalidate', async () => {
    const { service, prisma, redis, revalidate } = setup(['a', 'b', 'c']);
    await service.reorder(['c', 'a', 'b']);
    expect(prisma.banner.update).toHaveBeenCalledWith({ where: { id: 'c' }, data: { sortOrder: 0 } });
    expect(prisma.banner.update).toHaveBeenCalledWith({ where: { id: 'b' }, data: { sortOrder: 2 } });
    expect(redis.delCache).toHaveBeenCalledWith('banners:public');
    expect(revalidate.trigger).toHaveBeenCalledWith('banners');
  });

  it('từ chối id trùng hoặc không tồn tại', async () => {
    const { service } = setup(['a', 'b']);
    await expect(service.reorder(['a', 'a'])).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.reorder(['a', 'zzz'])).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('BannersService thùng rác', () => {
  const DAY = 24 * 60 * 60 * 1000;

  function trashSetup(
    opts: {
      lock?: boolean;
      expired?: { id: string; imageKey: string }[];
      settings?: { autoPurgeEnabled?: boolean; retentionDays?: number };
    } = {},
  ) {
    const prisma = {
      banner: {
        findFirst: vi.fn(async () => ({ id: 'a', imageKey: 'banners/k1' })),
        findMany: vi.fn(async () => opts.expired ?? []),
        update: vi.fn(async () => ({})),
        delete: vi.fn(async () => ({})),
      },
      siteSetting: {
        findUnique: vi.fn(async ({ where }: { where: { key: string } }) =>
          where.key === 'banners.trash' && opts.settings ? { value: opts.settings } : null,
        ),
        upsert: vi.fn(async () => ({})),
      },
    };
    const redis = { del: vi.fn(), delCache: vi.fn(), get: vi.fn(), set: vi.fn(), acquireLock: vi.fn(async () => opts.lock ?? true) };
    const storage = { deletePrefix: vi.fn(async () => undefined) };
    const media = new MediaService(storage as never, {} as never);
    const revalidate = { trigger: vi.fn() };
    const service = new BannersService(prisma as never, redis as never, media, revalidate as never);
    return { service, prisma, redis, storage, revalidate };
  }

  const cutoffAgeDays = (prisma: ReturnType<typeof trashSetup>['prisma'], before: number) => {
    const where = (prisma.banner.findMany.mock.calls[0] as unknown as [{ where: { deletedAt: { lt: Date } } }])[0].where;
    return Math.round((before - where.deletedAt.lt.getTime()) / DAY);
  };

  it('xoá = soft delete: đánh dấu deletedAt/deletedById, không đụng MinIO, có revalidate', async () => {
    const { service, prisma, storage, revalidate } = trashSetup();
    await service.remove('a', 'user-1');
    const call = prisma.banner.update.mock.calls[0] as unknown as [{ data: { deletedAt: Date; deletedById: string } }];
    expect(call[0].data.deletedById).toBe('user-1');
    expect(call[0].data.deletedAt).toBeInstanceOf(Date);
    expect(prisma.banner.delete).not.toHaveBeenCalled();
    expect(storage.deletePrefix).not.toHaveBeenCalled();
    expect(revalidate.trigger).toHaveBeenCalledWith('banners');
  });

  it('purgeExpired dùng mặc định 30 ngày, xoá DB + object public/private và ghi lần chạy', async () => {
    const { service, prisma, storage, redis } = trashSetup({ expired: [{ id: 'old', imageKey: 'banners/k9' }] });
    const before = Date.now();
    const run = await service.purgeExpired('admin');

    expect(run).toMatchObject({ by: 'admin', purged: 1 });
    expect(cutoffAgeDays(prisma, before)).toBe(30);
    expect(prisma.banner.delete).toHaveBeenCalledWith({ where: { id: 'old' } });
    expect(storage.deletePrefix).toHaveBeenCalledWith('banners/k9/');
    expect(storage.deletePrefix).toHaveBeenCalledWith('private/banners/k9/');
    expect(prisma.siteSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { key: 'banners.trash.lastRun' } }),
    );
    expect(redis.del).toHaveBeenCalledWith('lock:banners:purge');
  });

  it('purgeExpired theo số ngày lưu ADMIN cấu hình', async () => {
    const { service, prisma } = trashSetup({ settings: { retentionDays: 7 } });
    const before = Date.now();
    await service.purgeExpired('admin');
    expect(cutoffAgeDays(prisma, before)).toBe(7);
  });

  it('purgeExpired báo 409 khi một lượt dọn khác đang giữ lock', async () => {
    const { service, prisma } = trashSetup({ lock: false });
    await expect(service.purgeExpired('admin')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.banner.findMany).not.toHaveBeenCalled();
  });

  it('job hằng đêm bỏ qua khi tự dọn bị tắt, chạy khi bật', async () => {
    const off = trashSetup({ settings: { autoPurgeEnabled: false } });
    await off.service.scheduledPurge();
    expect(off.redis.acquireLock).not.toHaveBeenCalled();

    const on = trashSetup({ settings: { autoPurgeEnabled: true } });
    await on.service.scheduledPurge();
    expect(on.prisma.banner.findMany).toHaveBeenCalled();
  });
});

describe('BannersService.update khi có request ghi chen vào', () => {
  it('banner đã bị sửa sau lúc đọc -> 409, dọn ảnh vừa upload, không xoá ảnh cũ', async () => {
    const existing = { id: 'a', imageKey: 'banners/old', updatedAt: new Date('2026-10-03T00:00:00.000Z') };
    const prisma = {
      banner: {
        findFirst: vi.fn(async () => existing),
        updateMany: vi.fn(async () => ({ count: 0 })), // người khác đã ghi -> updated_at đã đổi
      },
    };
    const media = {
      uploadImage: vi.fn(async () => ({ imageKey: 'banners/new', imageUrl: 'n', images: [] })),
      removeImage: vi.fn(async () => undefined),
    };
    const service = new BannersService(prisma as never, { delCache: vi.fn() } as never, media as never, { trigger: vi.fn() } as never);

    await expect(service.update('a', { title: 'x' }, { buffer: Buffer.from('x') } as Express.Multer.File)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.banner.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 'a', updatedAt: existing.updatedAt }) }),
    );
    expect(media.removeImage).toHaveBeenCalledTimes(1);
    expect(media.removeImage).toHaveBeenCalledWith('banners/new');
  });
});

describe('BannersService cài đặt có khoá lạc quan (If-Match)', () => {
  function settingsSetup() {
    let clock = Date.parse('2026-10-03T00:00:00.000Z');
    const table = new Map<string, { value: unknown; updatedAt: Date }>([
      ['homepage.banner.swiper', { value: { autoPlayInterval: 3500, pauseOnHover: true, showDots: false }, updatedAt: new Date(clock) }],
    ]);
    const prisma = {
      siteSetting: {
        findUnique: vi.fn(async ({ where }: { where: { key: string } }) =>
          table.has(where.key) ? { key: where.key, ...table.get(where.key)! } : null,
        ),
        create: vi.fn(async ({ data }: { data: { key: string; value: unknown } }) => {
          table.set(data.key, { value: data.value, updatedAt: new Date(++clock) });
        }),
        updateMany: vi.fn(async ({ where, data }: { where: { key: string; updatedAt: Date }; data: { value: unknown } }) => {
          const row = table.get(where.key);
          if (!row || row.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
          table.set(where.key, { value: data.value, updatedAt: new Date(++clock) });
          return { count: 1 };
        }),
      },
    };
    const service = new BannersService(prisma as never, { delCache: vi.fn() } as never, {} as never, { trigger: vi.fn() } as never);
    return { service, table };
  }

  it('swiper: lưu với phiên bản đúng -> trả cài đặt + phiên bản mới; lưu lại với phiên bản cũ -> 409', async () => {
    const { service, table } = settingsSetup();
    const opened = (await service.getSwiperSettingsForCms()).version!;
    const saved = await service.updateSwiperSettings({ autoPlayInterval: 5000, pauseOnHover: true, showDots: true }, opened);
    expect(saved).toMatchObject({ autoPlayInterval: 5000, showDots: true });
    expect(saved.version).not.toBe(opened);
    await expect(
      service.updateSwiperSettings({ autoPlayInterval: 2000, pauseOnHover: false, showDots: false }, opened),
    ).rejects.toBeInstanceOf(ConflictException);
    expect((table.get('homepage.banner.swiper')!.value as { autoPlayInterval: number }).autoPlayInterval).toBe(5000);
  });

  it('thùng rác: chưa có cài đặt -> lưu lần đầu không cần phiên bản, trả kèm phiên bản', async () => {
    const { service } = settingsSetup();
    vi.spyOn(service as never, 'getTrashOverview' as never);
    const res = await service.updateTrashSettings({ autoPurgeEnabled: false, retentionDays: 7 });
    expect(res).toMatchObject({ autoPurgeEnabled: false, retentionDays: 7, version: expect.any(String) });
  });
});
