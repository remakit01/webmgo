// Form chuyên mục: chuyển đổi dữ liệu, kiểm lỗi, so sánh thay đổi — hàm thuần, không phụ thuộc React.

import type { Locale } from '@remak/shared/locale';
import { isValidSlug } from '@remak/shared/slug';
import type { CategoryInput } from '@/cms/lib/news-api';
import { newsCategoryPath } from '@/lib/news-paths';
import type { NewsCategoryCms, NewsCategoryColor } from '@/types/news';

export const NAME_MAX = 100;
export const SLUG_MAX = 120;
export const DESCRIPTION_MAX = 500;

export interface CategoryTranslationForm {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface CategoryForm {
  /** null = chuyên mục mới */
  id: string | null;
  version: string | null;
  color: NewsCategoryColor;
  isActive: boolean;
  translations: Record<Locale, CategoryTranslationForm>;
}

const EMPTY_TR: CategoryTranslationForm = { name: '', slug: '', description: '', seoTitle: '', seoDescription: '' };

export const emptyCategoryForm = (): CategoryForm => ({
  id: null,
  version: null,
  color: 'green',
  isActive: true,
  translations: { vi: { ...EMPTY_TR }, en: { ...EMPTY_TR } },
});

export function toCategoryForm(c: NewsCategoryCms): CategoryForm {
  const tr = (l: Locale): CategoryTranslationForm => {
    const t = c.translations[l];
    return t
      ? { name: t.name, slug: t.slug, description: t.description ?? '', seoTitle: t.seoTitle ?? '', seoDescription: t.seoDescription ?? '' }
      : { ...EMPTY_TR };
  };
  return { id: c.id, version: c.version, color: c.color, isActive: c.isActive, translations: { vi: tr('vi'), en: tr('en') } };
}

/** Không gửi sortOrder: thứ tự đổi bằng nút ▲ ▼ ở danh sách (API riêng) — tránh ghi đè thứ tự khi lưu form */
export function toCategoryInput(f: CategoryForm): CategoryInput {
  const tr = (t: CategoryTranslationForm) => ({
    name: t.name.trim(),
    slug: t.slug.trim() || undefined,
    description: t.description.trim() || null,
    seoTitle: t.seoTitle.trim() || null,
    seoDescription: t.seoDescription.trim() || null,
  });
  return {
    color: f.color,
    isActive: f.isActive,
    // Bỏ trống tên tiếng Anh = xoá bản tiếng Anh (trang /en dùng tên tiếng Việt)
    translations: { vi: tr(f.translations.vi), en: f.translations.en.name.trim() ? tr(f.translations.en) : null },
  };
}

export type CategoryField = 'name' | 'slug';
/** Lỗi theo ô, khoá dạng "vi.name" */
export type CategoryErrors = Partial<Record<`${Locale}.${CategoryField}`, string>>;

export function validateCategory(f: CategoryForm): CategoryErrors {
  const errors: CategoryErrors = {};
  if (!f.translations.vi.name.trim()) errors['vi.name'] = 'Nhập tên chuyên mục tiếng Việt';
  for (const l of ['vi', 'en'] as const) {
    const t = f.translations[l];
    if (l === 'en' && !t.name.trim() && t.slug.trim()) errors['en.name'] = 'Có đường dẫn tiếng Anh thì phải có tên tiếng Anh';
    if (t.slug.trim() && !isValidSlug(t.slug.trim())) errors[`${l}.slug`] = 'Chỉ gồm chữ thường không dấu, số và dấu gạch ngang';
  }
  return errors;
}

/** Có thay đổi so với lúc mở form không (bỏ qua khoảng trắng thừa, không so version) */
export function isCategoryDirty(a: CategoryForm, b: CategoryForm): boolean {
  const norm = (f: CategoryForm) => JSON.stringify({ ...toCategoryInput(f), id: f.id });
  return norm(a) !== norm(b);
}

/** Đường dẫn trang chuyên mục trên website (theo routing song ngữ — news-paths) */
export const categoryPath = (locale: Locale, slug: string) => newsCategoryPath(locale, slug);
/** Tiền tố hiển thị trước ô đường dẫn, vd "/tin-tuc/chuyen-muc/" */
const SLUG_MARK = '__slug__';
export const CATEGORY_PATH_PREFIX: Record<Locale, string> = {
  vi: categoryPath('vi', SLUG_MARK).replace(SLUG_MARK, ''),
  en: categoryPath('en', SLUG_MARK).replace(SLUG_MARK, ''),
};
