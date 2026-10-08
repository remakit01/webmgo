// Form Loại sản phẩm: chuyển đổi dữ liệu, kiểm lỗi, so sánh thay đổi — hàm thuần, không phụ thuộc React.

import type { Locale } from '@remak/shared/locale';
import { isValidSlug } from '@remak/shared/slug';
import {
  PRODUCT_TYPE_LIMITS,
  type ProductSpecProfile,
  type ProductTypeCms,
  type ProductTypeInput,
  type ProductTypeTranslationInput,
} from '@remak/shared/contracts/product';
import { productTypePath } from '@/lib/product-paths';

export const NAME_MAX = PRODUCT_TYPE_LIMITS.name;
export const SLUG_MAX = PRODUCT_TYPE_LIMITS.slug;
export const DESCRIPTION_MAX = PRODUCT_TYPE_LIMITS.description;

export interface ProductTypeTranslationForm {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ProductTypeForm {
  /** null = loại mới */
  id: string | null;
  version: string | null;
  specProfile: ProductSpecProfile;
  isActive: boolean;
  translations: Record<Locale, ProductTypeTranslationForm>;
}

const EMPTY_TR: ProductTypeTranslationForm = { name: '', slug: '', description: '', seoTitle: '', seoDescription: '' };

export const emptyProductTypeForm = (): ProductTypeForm => ({
  id: null,
  version: null,
  specProfile: 'NONE',
  isActive: true,
  translations: { vi: { ...EMPTY_TR }, en: { ...EMPTY_TR } },
});

export function toProductTypeForm(t: ProductTypeCms): ProductTypeForm {
  const tr = (l: Locale): ProductTypeTranslationForm => {
    const x = t.translations[l];
    return x
      ? { name: x.name, slug: x.slug, description: x.description ?? '', seoTitle: x.seoTitle ?? '', seoDescription: x.seoDescription ?? '' }
      : { ...EMPTY_TR };
  };
  return { id: t.id, version: t.version, specProfile: t.specProfile, isActive: t.isActive, translations: { vi: tr('vi'), en: tr('en') } };
}

/** Không gửi thứ tự: đổi bằng nút ▲ ▼ ở danh sách (API riêng) */
export function toProductTypeInput(f: ProductTypeForm): ProductTypeInput {
  const tr = (t: ProductTypeTranslationForm): ProductTypeTranslationInput => ({
    name: t.name.trim(),
    slug: t.slug.trim() || undefined,
    description: t.description.trim() || null,
    seoTitle: t.seoTitle.trim() || null,
    seoDescription: t.seoDescription.trim() || null,
  });
  return {
    specProfile: f.specProfile,
    isActive: f.isActive,
    // Bỏ trống tên tiếng Anh = chưa có bản tiếng Anh (loại không hiện ở web /en)
    translations: { vi: tr(f.translations.vi), en: f.translations.en.name.trim() ? tr(f.translations.en) : null },
  };
}

export type ProductTypeField = 'name' | 'slug';
/** Lỗi theo ô, khoá dạng "vi.name" */
export type ProductTypeErrors = Partial<Record<`${Locale}.${ProductTypeField}`, string>>;

export function validateProductType(f: ProductTypeForm): ProductTypeErrors {
  const errors: ProductTypeErrors = {};
  if (!f.translations.vi.name.trim()) errors['vi.name'] = 'Nhập tên loại sản phẩm tiếng Việt';
  for (const l of ['vi', 'en'] as const) {
    const t = f.translations[l];
    if (l === 'en' && !t.name.trim() && t.slug.trim()) errors['en.name'] = 'Có đường dẫn tiếng Anh thì phải có tên tiếng Anh';
    if (t.slug.trim() && !isValidSlug(t.slug.trim())) errors[`${l}.slug`] = 'Chỉ gồm chữ thường không dấu, số và dấu gạch ngang';
  }
  return errors;
}

/** Có thay đổi so với lúc mở form không (bỏ qua khoảng trắng thừa, không so version) */
export function isProductTypeDirty(a: ProductTypeForm, b: ProductTypeForm): boolean {
  const norm = (f: ProductTypeForm) => JSON.stringify({ ...toProductTypeInput(f), id: f.id });
  return norm(a) !== norm(b);
}

/** Tiền tố hiển thị trước ô đường dẫn, vd "/san-pham/loai/" */
const SLUG_MARK = '__slug__';
export const PRODUCT_TYPE_PATH_PREFIX: Record<Locale, string> = {
  vi: productTypePath('vi', SLUG_MARK).replace(SLUG_MARK, ''),
  en: productTypePath('en', SLUG_MARK).replace(SLUG_MARK, ''),
};
