// Form tác giả: chuyển đổi dữ liệu, kiểm lỗi, so sánh thay đổi — hàm thuần.

import type { Locale } from '@remak/shared/locale';
import type { AuthorInput } from '@/cms/lib/news-api';
import type { NewsAuthorCms } from '@/types/news';

export const AUTHOR_NAME_MAX = 120;
export const JOB_TITLE_MAX = 120;
export const BIO_MAX = 1000;

export interface AuthorTranslationForm {
  jobTitle: string;
  bio: string;
}

export interface AuthorForm {
  /** null = tác giả mới */
  id: string | null;
  version: string | null;
  /** Tên riêng — không dịch */
  name: string;
  avatarUrl: string;
  isActive: boolean;
  translations: Record<Locale, AuthorTranslationForm>;
}

const EMPTY_TR: AuthorTranslationForm = { jobTitle: '', bio: '' };

export const emptyAuthorForm = (): AuthorForm => ({
  id: null,
  version: null,
  name: '',
  avatarUrl: '',
  isActive: true,
  translations: { vi: { ...EMPTY_TR }, en: { ...EMPTY_TR } },
});

export function toAuthorForm(a: NewsAuthorCms): AuthorForm {
  const tr = (l: Locale): AuthorTranslationForm => ({ jobTitle: a.translations[l]?.jobTitle ?? '', bio: a.translations[l]?.bio ?? '' });
  return { id: a.id, version: a.version, name: a.name, avatarUrl: a.avatarUrl ?? '', isActive: a.isActive, translations: { vi: tr('vi'), en: tr('en') } };
}

export function toAuthorInput(f: AuthorForm, avatarUrl: string | null): AuthorInput {
  const tr = (t: AuthorTranslationForm) => ({ jobTitle: t.jobTitle.trim() || null, bio: t.bio.trim() || null });
  return { name: f.name.trim(), avatarUrl, isActive: f.isActive, translations: { vi: tr(f.translations.vi), en: tr(f.translations.en) } };
}

export function validateAuthor(f: AuthorForm): { name?: string } {
  return f.name.trim() ? {} : { name: 'Nhập tên hiển thị của tác giả' };
}

/** Có thay đổi so với lúc mở form (kể cả vừa chọn ảnh mới) */
export function isAuthorDirty(a: AuthorForm, b: AuthorForm, pickedAvatar: boolean): boolean {
  return pickedAvatar || JSON.stringify(toAuthorInput(a, a.avatarUrl || null)) !== JSON.stringify(toAuthorInput(b, b.avatarUrl || null));
}

/** Đã có chức danh / tiểu sử ở ngôn ngữ này chưa (hộp tác giả chỉ hiện khi có) */
export const hasProfile = (t: AuthorTranslationForm | { jobTitle: string | null; bio: string | null } | undefined) =>
  Boolean(t && (t.jobTitle?.trim() || t.bio?.trim()));
