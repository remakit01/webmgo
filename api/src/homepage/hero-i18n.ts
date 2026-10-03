// Ghép bản dịch lên bản tiếng Việt theo TỪNG TRƯỜNG: trường dịch rỗng/thiếu -> dùng tiếng Việt.
// GIỮ ĐỒNG BỘ với fe/src/lib/hero-i18n.ts (CMS dùng để xem trước đúng như trang /en).

export interface HeroCtaShape {
  text: string;
  link: string;
}

export interface HeroContentShape {
  title: string;
  subtitle: string;
  paragraphs: string[];
  primaryCta: HeroCtaShape;
  secondaryCta?: HeroCtaShape | null;
  // Các trường khác của thẻ (vd accent) được giữ nguyên khi ghép
  stats: { value: string; label: string; sublabel: string }[];
  media: { frameTitle: string; badge: string; alt: string };
}

export interface HeroTranslationShape {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  primaryCta?: Partial<HeroCtaShape>;
  secondaryCta?: Partial<HeroCtaShape>;
  stats?: { value?: string; label?: string; sublabel?: string }[];
  media?: { frameTitle?: string; badge?: string; alt?: string };
}

const pick = (translated: string | undefined, source: string) =>
  translated !== undefined && translated.trim() !== '' ? translated.trim() : source;

const mergeCta = (source: HeroCtaShape, t?: Partial<HeroCtaShape>): HeroCtaShape => ({
  text: pick(t?.text, source.text),
  link: pick(t?.link, source.link),
});

export function mergeHeroTranslation<T extends HeroContentShape>(vi: T, t: HeroTranslationShape | null | undefined): T {
  if (!t) return vi;
  const paragraphs = (t.paragraphs ?? []).map((p) => p.trim()).filter(Boolean);
  const merged: HeroContentShape = {
    ...vi,
    title: pick(t.title, vi.title),
    subtitle: pick(t.subtitle, vi.subtitle),
    // Đoạn mô tả dịch theo cả khối: có ít nhất 1 đoạn tiếng Anh thì dùng toàn bộ bản Anh
    paragraphs: paragraphs.length ? paragraphs : vi.paragraphs,
    primaryCta: mergeCta(vi.primaryCta, t.primaryCta),
    // Nút phụ ẩn/hiện theo bản tiếng Việt
    secondaryCta: vi.secondaryCta ? mergeCta(vi.secondaryCta, t.secondaryCta) : null,
    // Thẻ số liệu ghép theo vị trí; màu nhấn dùng chung (lấy từ tiếng Việt)
    stats: vi.stats.map((s, i) => ({
      ...s,
      value: pick(t.stats?.[i]?.value, s.value),
      label: pick(t.stats?.[i]?.label, s.label),
      sublabel: pick(t.stats?.[i]?.sublabel, s.sublabel),
    })),
    media: {
      frameTitle: pick(t.media?.frameTitle, vi.media.frameTitle),
      badge: pick(t.media?.badge, vi.media.badge),
      alt: pick(t.media?.alt, vi.media.alt),
    },
  };
  return merged as T;
}
