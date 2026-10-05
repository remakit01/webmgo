import { BadRequestException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HeroService, applyTranslationPatch } from './hero.service.js';
import { HeroPublicQueryDto, HeroTranslationDto, UpdateHeroDto } from './dto/hero.dto.js';

const VALID_HERO = {
  title: 'Tấm Chống Cháy MGO',
  subtitle: 'Phụ đề',
  paragraphs: ['Chịu lửa **1.200°C**'],
  primaryCta: { text: 'Nhận mẫu', link: '/nhan-mau-thu' },
  secondaryCta: { text: 'Dự toán', link: '#du-toan' },
  stats: [
    { value: '1', label: 'a', sublabel: '', accent: 'orange' },
    { value: '2', label: 'b', sublabel: '', accent: 'green' },
    { value: '3', label: 'c', sublabel: '', accent: 'green-dark' },
    { value: '4', label: 'd', sublabel: '', accent: 'slate' },
  ],
  media: { frameTitle: 'Khung', badge: 'Badge', alt: 'Ảnh tấm MGO' },
};

// Giả lập bảng site_settings có cột updated_at (mỗi lần ghi tăng 1ms) để test khoá lạc quan
function setup(rows: { key: string; value: unknown }[] = []) {
  let clock = Date.parse('2026-10-03T00:00:00.000Z');
  const tick = () => new Date(++clock);
  const table = new Map(rows.map((r) => [r.key, { value: r.value, updatedAt: tick() }]));
  const db = { get: (key: string) => table.get(key)?.value };
  const version = (key: string) => table.get(key)?.updatedAt.toISOString();
  const prisma = {
    siteSetting: {
      findMany: vi.fn(async () => [...table.entries()].map(([key, r]) => ({ key, ...r }))),
      findUnique: vi.fn(async ({ where }: { where: { key: string } }) =>
        table.has(where.key) ? { key: where.key, ...table.get(where.key)! } : null,
      ),
      count: vi.fn(async ({ where }: { where: { key: string } }) => (table.has(where.key) ? 1 : 0)),
      create: vi.fn(async ({ data }: { data: { key: string; value: unknown } }) => {
        if (table.has(data.key)) throw new Error('unique violation');
        table.set(data.key, { value: data.value, updatedAt: tick() });
      }),
      updateMany: vi.fn(
        async ({ where, data }: { where: { key: string; updatedAt: Date }; data: { value: unknown } }) => {
          const row = table.get(where.key);
          if (!row || row.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
          table.set(where.key, { value: data.value, updatedAt: tick() });
          return { count: 1 };
        },
      ),
    },
  };
  const redis = { getJson: vi.fn(async () => null), setJson: vi.fn(), delCache: vi.fn() };
  const media = {
    uploadImage: vi.fn(async () => ({ imageKey: 'homepage/hero/new', imageUrl: 'u', images: [] })),
    removeImage: vi.fn(async () => undefined),
  };
  const revalidate = { trigger: vi.fn() };
  const service = new HeroService(prisma as never, redis as never, media as never, revalidate as never);
  return { service, prisma, redis, media, revalidate, db, version };
}

describe('HeroService', () => {
  it('getPublic trả null khi chưa cấu hình và không ghi cache', async () => {
    const { service, redis } = setup();
    expect(await service.getPublic()).toBeNull();
    expect(redis.setJson).not.toHaveBeenCalled();
  });

  it('getPublic ưu tiên cache, miss thì đọc DB rồi ghi cache', async () => {
    const { service, redis, prisma } = setup([{ key: 'homepage.hero', value: VALID_HERO }]);
    const hero = await service.getPublic();
    expect(hero?.title).toBe(VALID_HERO.title);
    expect(hero?.image).toBeNull();
    expect(redis.setJson).toHaveBeenCalledWith('homepage:hero:public:vi', hero, 60);

    redis.getJson.mockResolvedValueOnce({ title: 'từ cache' } as never);
    expect((await service.getPublic())?.title).toBe('từ cache');
    expect(prisma.siteSetting.findMany).toHaveBeenCalledTimes(1);
  });

  it('update lưu nội dung, xoá cache và revalidate tag homepage-hero', async () => {
    const { service, db, redis, revalidate } = setup();
    await service.update({ ...VALID_HERO, title: '  Tiêu đề  ' } as UpdateHeroDto);
    expect((db.get('homepage.hero') as { title: string }).title).toBe('Tiêu đề');
    expect(redis.delCache).toHaveBeenCalledWith('homepage:hero:public:vi');
    expect(redis.delCache).toHaveBeenCalledWith('homepage:hero:public:en');
    expect(revalidate.trigger).toHaveBeenCalledWith('homepage-hero');
  });

  it('updateImage: lưu ảnh mới rồi mới xoá ảnh cũ', async () => {
    const { service, media, db } = setup([
      { key: 'homepage.hero', value: VALID_HERO },
      { key: 'homepage.hero.image', value: { imageKey: 'homepage/hero/old', imageUrl: 'o', images: [] } },
    ]);
    await service.updateImage({ buffer: Buffer.from('x') } as Express.Multer.File);
    expect(media.uploadImage).toHaveBeenCalledWith('homepage/hero', expect.any(Buffer));
    expect((db.get('homepage.hero.image') as { imageKey: string }).imageKey).toBe('homepage/hero/new');
    expect(media.removeImage).toHaveBeenCalledWith('homepage/hero/old');
  });

  it('updateImage: ghi DB thất bại thì dọn ảnh vừa upload', async () => {
    const { service, media, prisma } = setup([{ key: 'homepage.hero', value: VALID_HERO }]);
    prisma.siteSetting.create.mockRejectedValueOnce(new Error('db down'));
    await expect(service.updateImage({ buffer: Buffer.from('x') } as Express.Multer.File)).rejects.toBeInstanceOf(ConflictException);
    expect(media.removeImage).toHaveBeenCalledWith('homepage/hero/new');
  });

  it('updateImage từ chối khi chưa có nội dung hero hoặc thiếu file', async () => {
    const { service } = setup();
    await expect(service.updateImage({ buffer: Buffer.from('x') } as Express.Multer.File)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.updateImage(undefined)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('UpdateHeroDto', () => {
  const errorsOf = async (patch: object) =>
    (await validate(plainToInstance(UpdateHeroDto, { ...VALID_HERO, ...patch }))).map((e) => e.property);

  it('chấp nhận dữ liệu hợp lệ, nút phụ có thể bỏ trống', async () => {
    expect(await errorsOf({})).toEqual([]);
    expect(await errorsOf({ secondaryCta: undefined })).toEqual([]);
  });

  it('chặn màu ngoài bảng brand, link javascript:, sai số thẻ', async () => {
    expect(await errorsOf({ stats: VALID_HERO.stats.map((s) => ({ ...s, accent: '#0EA5E9' })) })).toContain('stats');
    expect(await errorsOf({ primaryCta: { text: 'x', link: 'javascript:alert(1)' } })).toContain('primaryCta');
    expect(await errorsOf({ primaryCta: { text: 'x', link: '//evil.com' } })).toContain('primaryCta');
    expect(await errorsOf({ stats: VALID_HERO.stats.slice(0, 3) })).toContain('stats');
    expect(await errorsOf({ paragraphs: [] })).toContain('paragraphs');
  });
});

describe('HeroService bản dịch', () => {
  it('getPublic(en) ghép bản dịch lên tiếng Việt và cache riêng theo ngôn ngữ', async () => {
    const { service, redis } = setup([
      { key: 'homepage.hero', value: VALID_HERO },
      { key: 'homepage.hero.en', value: { title: 'English title' } },
    ]);
    const en = await service.getPublic('en');
    expect(en?.title).toBe('English title');
    expect(en?.subtitle).toBe(VALID_HERO.subtitle);
    expect(redis.setJson).toHaveBeenCalledWith('homepage:hero:public:en', en, 60);
    expect((await service.getPublic('vi'))?.title).toBe(VALID_HERO.title);
  });

  it('getForCms trả bản gốc, bản dịch thô, ảnh và phiên bản từng phần', async () => {
    const { service, version } = setup([{ key: 'homepage.hero', value: VALID_HERO }]);
    expect(await service.getForCms()).toEqual({
      vi: VALID_HERO,
      en: {},
      image: null,
      versions: { vi: version('homepage.hero'), en: null, image: null },
    });
  });

  it('patchTranslation lưu homepage.hero.en (cắt khoảng trắng), xoá cache 2 ngôn ngữ và revalidate', async () => {
    const { service, db, redis, revalidate } = setup([{ key: 'homepage.hero', value: VALID_HERO }]);
    const res = await service.patchTranslation('en', { title: '  Hello  ', stats: [{ value: '1,200°C' }] });
    const saved = db.get('homepage.hero.en') as { title: string; stats: { value: string; label: string }[] };
    expect(saved.title).toBe('Hello');
    expect(saved.stats[0]).toEqual({ value: '1,200°C', label: '', sublabel: '' });
    expect(res.en).toEqual(saved);
    expect(res.versions.en).toEqual(expect.any(String));
    expect(redis.delCache).toHaveBeenCalledWith('homepage:hero:public:vi');
    expect(redis.delCache).toHaveBeenCalledWith('homepage:hero:public:en');
    expect(revalidate.trigger).toHaveBeenCalledWith('homepage-hero');
  });
});

describe('HeroTranslationDto / HeroPublicQueryDto', () => {
  const errorsOf = async (body: object) =>
    (await validate(plainToInstance(HeroTranslationDto, body))).map((e) => e.property);

  it('bản dịch rỗng hoặc chỉ một phần là hợp lệ, link rỗng hợp lệ', async () => {
    expect(await errorsOf({})).toEqual([]);
    expect(await errorsOf({ title: 'Hi', primaryCta: { text: '', link: '' }, stats: [{}] })).toEqual([]);
  });

  it('vẫn chặn link nguy hiểm và quá 4 thẻ', async () => {
    expect(await errorsOf({ primaryCta: { link: 'javascript:alert(1)' } })).toContain('primaryCta');
    expect(await errorsOf({ secondaryCta: { link: '//evil.com' } })).toContain('secondaryCta');
    expect(await errorsOf({ stats: [{}, {}, {}, {}, {}] })).toContain('stats');
  });

  it('locale chỉ nhận vi hoặc en', async () => {
    const q = async (locale: string) => (await validate(plainToInstance(HeroPublicQueryDto, { locale }))).length;
    expect(await q('vi')).toBe(0);
    expect(await q('en')).toBe(0);
    expect(await q('fr')).toBe(1);
  });
});

describe('applyTranslationPatch (PATCH chỉ đổi trường được gửi)', () => {
  const current = {
    title: 'Old title',
    subtitle: 'Old sub',
    paragraphs: ['P1'],
    primaryCta: { text: 'Get samples', link: '/nhan-mau-thu' },
    stats: [{ value: '1', label: 'Heat', sublabel: 'A1' }],
    media: { alt: 'Board' },
  };

  it('trường không gửi giữ nguyên, trường gửi "" thì xoá bản dịch (dùng tiếng Việt)', () => {
    const next = applyTranslationPatch(current, { subtitle: '', primaryCta: { text: 'Samples' } } as never);
    expect(next.title).toBe('Old title');
    expect(next.subtitle).toBe('');
    expect(next.primaryCta).toEqual({ text: 'Samples', link: '/nhan-mau-thu' });
    expect(next.paragraphs).toEqual(['P1']);
    expect(next.media).toEqual({ frameTitle: '', badge: '', alt: 'Board' });
  });

  it('thẻ số liệu vá theo vị trí và từng trường; mảng đoạn văn gửi lên thì thay cả mảng', () => {
    const next = applyTranslationPatch(current, { stats: [{ sublabel: 'Class A1' }, { label: 'Dry' }], paragraphs: ['N1', 'N2'] } as never);
    expect(next.stats).toEqual([
      { value: '1', label: 'Heat', sublabel: 'Class A1' },
      { value: '', label: 'Dry', sublabel: '' },
    ]);
    expect(next.paragraphs).toEqual(['N1', 'N2']);
  });
});

describe('HeroService khoá lạc quan (If-Match)', () => {
  it('lưu với phiên bản cũ -> 409, không ghi đè bản người khác vừa lưu', async () => {
    const { service, db, version } = setup([{ key: 'homepage.hero', value: VALID_HERO }]);
    const opened = version('homepage.hero')!; // A và B cùng mở CMS
    await service.update({ ...VALID_HERO, title: 'Bản của A' } as UpdateHeroDto, opened); // A lưu trước
    await expect(service.update({ ...VALID_HERO, title: 'Bản của B' } as UpdateHeroDto, opened)).rejects.toBeInstanceOf(
      ConflictException,
    ); // B lưu sau với phiên bản cũ
    expect((db.get('homepage.hero') as { title: string }).title).toBe('Bản của A');
  });

  it('lưu với phiên bản mới nhất thì thành công', async () => {
    const { service, version } = setup([{ key: 'homepage.hero', value: VALID_HERO }]);
    const res = await service.update({ ...VALID_HERO, title: 'Mới' } as UpdateHeroDto, version('homepage.hero'));
    expect(res.vi?.title).toBe('Mới');
    expect(res.versions.vi).not.toBe(null);
  });

  it('2 người cùng thay ảnh: người sau nhận 409 và ảnh họ vừa upload được dọn, ảnh cũ chỉ bị xoá 1 lần', async () => {
    const { service, media, db, version } = setup([
      { key: 'homepage.hero', value: VALID_HERO },
      { key: 'homepage.hero.image', value: { imageKey: 'homepage/hero/old', imageUrl: 'o', images: [] } },
    ]);
    const opened = version('homepage.hero.image')!;
    media.uploadImage
      .mockResolvedValueOnce({ imageKey: 'homepage/hero/A', imageUrl: 'a', images: [] })
      .mockResolvedValueOnce({ imageKey: 'homepage/hero/B', imageUrl: 'b', images: [] });

    await service.updateImage({ buffer: Buffer.from('a') } as Express.Multer.File, opened);
    await expect(service.updateImage({ buffer: Buffer.from('b') } as Express.Multer.File, opened)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect((db.get('homepage.hero.image') as { imageKey: string }).imageKey).toBe('homepage/hero/A');
    expect((media.removeImage.mock.calls as unknown as [string][]).map((c) => c[0])).toEqual(['homepage/hero/old', 'homepage/hero/B']);
  });
});
