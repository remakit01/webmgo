import { isSafeLink } from '@remak/shared/link';
import { HERO_ACCENTS, type HeroContent, type HeroTranslation } from '@/types/homepage';
import type { TranslatableEntry, TranslationGroup } from '@/cms/components/shared/translation-types';

export const MAX_PARAGRAPHS = 3;

// Cùng quy tắc với API (homepage/dto/hero.dto.ts): "/...", "#..." hoặc http(s)
export const LINK_ERROR = 'Đường dẫn phải bắt đầu bằng "/", "#" hoặc https://';
export const isValidLink = (link: string) => isSafeLink(link, { allowAnchor: true });

// Form trống (chỉ khung cấu trúc, không có nội dung) — dùng khi hero chưa từng được cấu hình
export const EMPTY_CONTENT: HeroContent = {
  title: '',
  subtitle: '',
  paragraphs: [''],
  primaryCta: { text: '', link: '' },
  secondaryCta: null,
  stats: HERO_ACCENTS.map((accent) => ({ value: '', label: '', sublabel: '', accent })),
  media: { frameTitle: '', badge: '', alt: '' },
};

/** Bản dịch đầy đủ khung (mọi chuỗi đã có giá trị, mảng khớp số phần tử tiếng Việt) để form điều khiển được */
export type HeroTranslationDraft = {
  title: string;
  subtitle: string;
  paragraphs: string[];
  primaryCta: { text: string; link: string };
  secondaryCta: { text: string; link: string };
  stats: { value: string; label: string; sublabel: string }[];
  media: { frameTitle: string; badge: string; alt: string };
};

/** Chép toàn bộ nội dung từ bản tiếng Việt sang bản dịch tiếng Anh để dịch nhanh */
export function copyViToEnDraft(vi: HeroContent): HeroTranslationDraft {
  return {
    title: vi.title,
    subtitle: vi.subtitle,
    paragraphs: [...vi.paragraphs],
    primaryCta: { ...vi.primaryCta },
    secondaryCta: vi.secondaryCta ? { ...vi.secondaryCta } : { text: '', link: '' },
    stats: vi.stats.map((s) => ({ value: s.value, label: s.label, sublabel: s.sublabel })),
    media: { ...vi.media },
  };
}

export function toTranslationDraft(vi: HeroContent, en: HeroTranslation): HeroTranslationDraft {
  return {
    title: en.title ?? '',
    subtitle: en.subtitle ?? '',
    paragraphs: vi.paragraphs.map((_, i) => en.paragraphs?.[i] ?? ''),
    primaryCta: { text: en.primaryCta?.text ?? '', link: en.primaryCta?.link ?? '' },
    secondaryCta: { text: en.secondaryCta?.text ?? '', link: en.secondaryCta?.link ?? '' },
    stats: vi.stats.map((_, i) => ({
      value: en.stats?.[i]?.value ?? '',
      label: en.stats?.[i]?.label ?? '',
      sublabel: en.stats?.[i]?.sublabel ?? '',
    })),
    media: { frameTitle: en.media?.frameTitle ?? '', badge: en.media?.badge ?? '', alt: en.media?.alt ?? '' },
  };
}

/**
 * Danh sách ô dịch được, chỉ gồm ô mà bản tiếng Việt có nội dung
 * (ô tiếng Việt bỏ trống thì không có gì để dịch). Dùng cho tiến độ và bộ lọc "chưa dịch".
 */
export function translatableEntries(vi: HeroContent, en: HeroTranslationDraft): TranslatableEntry[] {
  const entries: TranslatableEntry[] = [
    { key: 'title', source: vi.title, value: en.title },
    { key: 'subtitle', source: vi.subtitle, value: en.subtitle },
    ...vi.paragraphs.map((p, i) => ({ key: `paragraphs.${i}`, source: p, value: en.paragraphs[i] ?? '' })),
    { key: 'primaryCta.text', source: vi.primaryCta.text, value: en.primaryCta.text },
    { key: 'primaryCta.link', source: vi.primaryCta.link, value: en.primaryCta.link },
    ...(vi.secondaryCta
      ? [
          { key: 'secondaryCta.text', source: vi.secondaryCta.text, value: en.secondaryCta.text },
          { key: 'secondaryCta.link', source: vi.secondaryCta.link, value: en.secondaryCta.link },
        ]
      : []),
    ...vi.stats.flatMap((s, i) => [
      { key: `stats.${i}.value`, source: s.value, value: en.stats[i]?.value ?? '' },
      { key: `stats.${i}.label`, source: s.label, value: en.stats[i]?.label ?? '' },
      { key: `stats.${i}.sublabel`, source: s.sublabel, value: en.stats[i]?.sublabel ?? '' },
    ]),
    { key: 'media.frameTitle', source: vi.media.frameTitle, value: en.media.frameTitle },
    { key: 'media.badge', source: vi.media.badge, value: en.media.badge },
    { key: 'media.alt', source: vi.media.alt, value: en.media.alt },
  ];
  return entries.filter((e) => e.source.trim() !== '');
}

export const isTranslated = (e: TranslatableEntry) => e.value.trim() !== '';

/** Ô link (vi hoặc en) đang sai định dạng -> thông báo lỗi theo khoá ô */
export function linkErrors(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, link]) => link.trim() !== '' && !isValidLink(link.trim()))
      .map(([key]) => [key, LINK_ERROR]),
  );
}

/**
 * Body cho PATCH bản dịch: chỉ các nhóm trường đã đổi so với bản đã lưu
 * (2 người sửa 2 nhóm khác nhau không ghi đè lẫn nhau).
 */
export function translationPatch(draft: HeroTranslationDraft, saved: HeroTranslationDraft): Partial<HeroTranslationDraft> {
  return Object.fromEntries(
    (Object.keys(draft) as (keyof HeroTranslationDraft)[])
      .filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(saved[k]))
      .map((k) => [k, draft[k]]),
  ) as Partial<HeroTranslationDraft>;
}

// Header khoá lạc quan dùng chung cho mọi trang CMS
export { ifMatch } from '@/cms/lib/api-client';

/** Đọc giá trị một ô bản dịch theo khoá dạng "title", "paragraphs.0", "stats.1.label", "media.alt" */
export function getDraftField(draft: HeroTranslationDraft, key: string): string {
  const value = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], draft);
  return typeof value === 'string' ? value : '';
}

/** Ghi một ô bản dịch theo khoá (trả bản sao mới, không sửa đối tượng cũ) */
export function setDraftField(draft: HeroTranslationDraft, key: string, value: string): HeroTranslationDraft {
  const next = structuredClone(draft);
  const parts = key.split('.');
  let node = next as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    // Phần tiếp theo là số -> nút hiện tại là mảng (vd "paragraphs.0", "stats.1.label")
    node[parts[i]] ??= /^\d+$/.test(parts[i + 1]) ? [] : {};
    node = node[parts[i]] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
  return next;
}

// ─── Chọn ô để AI dịch ───────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  title: 'Tiêu đề chính',
  subtitle: 'Tiêu đề phụ',
  'primaryCta.text': 'Chữ nút chính',
  'secondaryCta.text': 'Chữ nút phụ',
  value: 'Số liệu',
  label: 'Tiêu đề',
  sublabel: 'Mô tả phụ',
  'media.alt': 'Mô tả ảnh (alt)',
  'media.frameTitle': 'Tiêu đề khung',
  'media.badge': 'Nhãn công nghệ',
};

const isLinkKey = (key: string) => key.endsWith('.link');

function labelOf(key: string): string {
  const paragraph = /^paragraphs\.(\d+)$/.exec(key);
  if (paragraph) return `Đoạn mô tả ${Number(paragraph[1]) + 1}`;
  const stat = /^stats\.\d+\.(\w+)$/.exec(key);
  if (stat) return FIELD_LABELS[stat[1]] ?? stat[1];
  return FIELD_LABELS[key] ?? key;
}

/**
 * Các ô có thể nhờ AI dịch, nhóm theo đúng khối trên form.
 * Bỏ ô đường dẫn (không cần dịch — trang /en tự đổi link) và ô tiếng Việt trống. Nhóm rỗng bị bỏ.
 */
export function translationGroups(vi: HeroContent, en: HeroTranslationDraft): TranslationGroup[] {
  const entries = translatableEntries(vi, en)
    .filter((e) => !isLinkKey(e.key))
    .map((e) => ({ ...e, label: labelOf(e.key) }));
  const pick = (test: (key: string) => boolean) => entries.filter((e) => test(e.key));

  const groups: TranslationGroup[] = [
    { id: 'text', title: 'Tiêu đề & mô tả', entries: pick((k) => k === 'title' || k === 'subtitle' || k.startsWith('paragraphs.')) },
    { id: 'cta', title: 'Nút hành động', entries: pick((k) => k.endsWith('Cta.text')) },
    ...vi.stats.map((_, i) => ({
      id: `stat-${i}`,
      title: `Thẻ số liệu #${i + 1}`,
      entries: pick((k) => k.startsWith(`stats.${i}.`)),
    })),
    { id: 'media', title: 'Ảnh sản phẩm', entries: pick((k) => k.startsWith('media.')) },
  ];
  return groups.filter((g) => g.entries.length > 0);
}
