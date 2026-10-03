import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { MediaService, type UploadedImage } from '../storage/media.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';
import { saveSettingVersioned } from '../common/site-settings.js';
import type { HeroLocale, HeroTranslationDto, UpdateHeroDto } from './dto/hero.dto.js';
import { mergeHeroTranslation, type HeroTranslationShape } from './hero-i18n.js';

// Nội dung chữ và ảnh lưu 2 key riêng: sửa chữ và thay ảnh không ghi đè lẫn nhau khi gửi đồng thời
export const HERO_CONTENT_KEY = 'homepage.hero';
export const HERO_IMAGE_KEY = 'homepage.hero.image';
// Bản dịch: một key mỗi ngôn ngữ (vd homepage.hero.en); tiếng Việt là bản gốc ở HERO_CONTENT_KEY
const translationKey = (locale: Exclude<HeroLocale, 'vi'>) => `${HERO_CONTENT_KEY}.${locale}`;
const cacheKey = (locale: HeroLocale) => `homepage:hero:public:${locale}`;
const ALL_LOCALES: HeroLocale[] = ['vi', 'en'];
const CACHE_TTL = 60;
const REVALIDATE_TAG = 'homepage-hero';

export type HeroContent = Omit<UpdateHeroDto, 'secondaryCta'> & { secondaryCta: UpdateHeroDto['secondaryCta'] | null };
export type HeroImage = UploadedImage;
export type HeroTranslation = HeroTranslationShape;
export interface Hero extends HeroContent {
  image: HeroImage | null;
}

/** Phiên bản (updatedAt ISO) của từng phần — CMS gửi lại qua header If-Match khi lưu */
export interface HeroVersions {
  vi: string | null;
  en: string | null;
  image: string | null;
}

/** Dữ liệu cho CMS: bản gốc VI + bản dịch thô (chưa ghép) để CMS biết trường nào chưa dịch */
export interface HeroForCms {
  vi: HeroContent | null;
  en: HeroTranslation;
  image: HeroImage | null;
  versions: HeroVersions;
}

type TranslationValue = Required<Pick<HeroTranslation, 'title' | 'subtitle' | 'paragraphs'>> & {
  primaryCta: { text: string; link: string };
  secondaryCta: { text: string; link: string };
  stats: { value: string; label: string; sublabel: string }[];
  media: { frameTitle: string; badge: string; alt: string };
};

const trim = (v: string | undefined) => (v ?? '').trim();

/**
 * PATCH bản dịch: chỉ trường CÓ GỬI mới đổi; chuỗi rỗng = xoá bản dịch trường đó (dùng tiếng Việt).
 * Nhờ vậy 2 người sửa 2 ô dịch khác nhau không xoá mất phần của nhau.
 */
export function applyTranslationPatch(current: HeroTranslation | undefined, dto: HeroTranslationDto): TranslationValue {
  const cur = current ?? {};
  const pick = (patch: string | undefined, prev: string | undefined) => (patch !== undefined ? trim(patch) : trim(prev));
  const pickObj = <K extends string>(keys: K[], patch: Partial<Record<K, string>> | undefined, prev: Partial<Record<K, string>> | undefined) =>
    Object.fromEntries(keys.map((k) => [k, pick(patch?.[k], prev?.[k])])) as Record<K, string>;

  const prevStats = cur.stats ?? [];
  const patchStats = dto.stats;
  const statCount = Math.max(prevStats.length, patchStats?.length ?? 0);

  return {
    title: pick(dto.title, cur.title),
    subtitle: pick(dto.subtitle, cur.subtitle),
    // Mảng đoạn văn: gửi lên là thay cả mảng (thứ tự đoạn có ý nghĩa)
    paragraphs: (dto.paragraphs ?? cur.paragraphs ?? []).map(trim),
    primaryCta: pickObj(['text', 'link'], dto.primaryCta, cur.primaryCta),
    secondaryCta: pickObj(['text', 'link'], dto.secondaryCta, cur.secondaryCta),
    // Thẻ số liệu ghép theo vị trí, từng trường
    stats: Array.from({ length: statCount }, (_, i) =>
      pickObj(['value', 'label', 'sublabel'], patchStats?.[i], prevStats[i]),
    ),
    media: pickObj(['frameTitle', 'badge', 'alt'], dto.media, cur.media),
  };
}

@Injectable()
export class HeroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly media: MediaService,
    private readonly revalidate: RevalidateService,
  ) {}

  /**
   * Trang chủ (ISR) theo ngôn ngữ. Bản EN = bản dịch ghép lên VI (trường chưa dịch dùng tiếng Việt).
   * null = chưa cấu hình -> FE không render section.
   */
  async getPublic(locale: HeroLocale = 'vi'): Promise<Hero | null> {
    const cached = await this.redis.getJson<Hero>(cacheKey(locale));
    if (cached) return cached;
    const { vi, en, image } = await this.getForCms();
    if (!vi) return null;
    const content = locale === 'vi' ? vi : mergeHeroTranslation(vi, en);
    const hero: Hero = { ...content, image };
    await this.redis.setJson(cacheKey(locale), hero, CACHE_TTL);
    return hero;
  }

  /** Bản tiếng Việt + ảnh (dùng nội bộ, seed). */
  async get(): Promise<Hero | null> {
    const { vi, image } = await this.getForCms();
    return vi ? { ...vi, image } : null;
  }

  async getForCms(): Promise<HeroForCms> {
    const keys = [HERO_CONTENT_KEY, HERO_IMAGE_KEY, translationKey('en')];
    const rows = await this.prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    const row = (key: string) => rows.find((r) => r.key === key);
    const version = (key: string) => row(key)?.updatedAt.toISOString() ?? null;
    return {
      vi: (row(HERO_CONTENT_KEY)?.value as HeroContent | undefined) ?? null,
      en: (row(translationKey('en'))?.value as HeroTranslation | undefined) ?? {},
      image: (row(HERO_IMAGE_KEY)?.value as HeroImage | undefined) ?? null,
      versions: { vi: version(HERO_CONTENT_KEY), en: version(translationKey('en')), image: version(HERO_IMAGE_KEY) },
    };
  }

  /** PUT: thay toàn bộ bản tiếng Việt (mọi trường bắt buộc theo DTO). */
  async update(dto: UpdateHeroDto, ifMatch?: string): Promise<HeroForCms> {
    const content: HeroContent = {
      title: dto.title.trim(),
      subtitle: dto.subtitle.trim(),
      paragraphs: dto.paragraphs.map((p) => p.trim()),
      primaryCta: dto.primaryCta,
      secondaryCta: dto.secondaryCta ?? null,
      stats: dto.stats,
      media: dto.media,
    };
    await saveSettingVersioned(this.prisma, HERO_CONTENT_KEY, () => content, ifMatch);
    await this.afterChange();
    return this.getForCms();
  }

  /** PATCH: cập nhật một phần bản dịch (xem applyTranslationPatch). */
  async patchTranslation(
    locale: Exclude<HeroLocale, 'vi'>,
    dto: HeroTranslationDto,
    ifMatch?: string,
  ): Promise<HeroForCms> {
    await saveSettingVersioned<TranslationValue, HeroTranslation>(
      this.prisma,
      translationKey(locale),
      (current) => applyTranslationPatch(current, dto),
      ifMatch,
    );
    await this.afterChange();
    return this.getForCms();
  }

  /**
   * PUT: thay ảnh. Upload mới -> ghi DB có kiểm tra phiên bản -> xoá ĐÚNG ảnh vừa bị thay.
   * 2 người thay ảnh cùng lúc: người sau nhận 409 và ảnh họ vừa upload được dọn -> không sót file rác MinIO.
   */
  async updateImage(file?: Express.Multer.File, ifMatch?: string): Promise<HeroForCms> {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "image")');
    const hasContent = await this.prisma.siteSetting.count({ where: { key: HERO_CONTENT_KEY } });
    if (!hasContent) throw new BadRequestException('Cần lưu nội dung tiêu đề trước khi tải ảnh');

    const uploaded = await this.media.uploadImage('homepage/hero', file.buffer);
    let previous: HeroImage | undefined;
    try {
      ({ previous } = await saveSettingVersioned<HeroImage>(this.prisma, HERO_IMAGE_KEY, () => uploaded, ifMatch));
    } catch (err) {
      await this.media.removeImage(uploaded.imageKey);
      throw err;
    }
    if (previous) await this.media.removeImage(previous.imageKey);
    await this.afterChange();
    return this.getForCms();
  }

  private async afterChange() {
    // Sửa VI cũng làm đổi bản EN (các trường fallback) -> xoá cache mọi ngôn ngữ
    await Promise.all(ALL_LOCALES.map((l) => this.redis.delCache(cacheKey(l))));
    await this.revalidate.trigger(REVALIDATE_TAG);
  }
}
