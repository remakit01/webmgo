// Form giá trị danh mục thông số: chuyển đổi dữ liệu, kiểm lỗi, so sánh thay đổi — hàm thuần, không phụ thuộc React.

import {
  SPEC_OPTION_CODE_MAX,
  isValidSpecOptionCode,
  type SpecOptionCms,
  type SpecOptionGroup,
  type SpecOptionInput,
} from '@remak/shared/contracts/product';

export interface SpecOptionForm {
  /** null = giá trị mới */
  id: string | null;
  version: string | null;
  group: SpecOptionGroup;
  /** Chỉ sửa được khi tạo mới; bỏ trống = sinh từ nhãn tiếng Việt */
  code: string;
  isActive: boolean;
  labels: { vi: string; en: string };
}

export const emptySpecOptionForm = (group: SpecOptionGroup): SpecOptionForm => ({
  id: null,
  version: null,
  group,
  code: '',
  isActive: true,
  labels: { vi: '', en: '' },
});

export const toSpecOptionForm = (o: SpecOptionCms): SpecOptionForm => ({
  id: o.id,
  version: o.version,
  group: o.group,
  code: o.code,
  isActive: o.isActive,
  labels: { vi: o.labels.vi ?? '', en: o.labels.en ?? '' },
});

export function toSpecOptionInput(f: SpecOptionForm): SpecOptionInput {
  return {
    group: f.group,
    code: f.code.trim() || undefined,
    isActive: f.isActive,
    // Bỏ trống nhãn tiếng Anh = web /en dùng nhãn tiếng Việt
    labels: { vi: f.labels.vi.trim(), en: f.labels.en.trim() || null },
  };
}

export type SpecOptionErrors = Partial<Record<'labelVi' | 'code', string>>;

export function validateSpecOption(f: SpecOptionForm): SpecOptionErrors {
  const errors: SpecOptionErrors = {};
  if (!f.labels.vi.trim()) errors.labelVi = 'Nhập nhãn tiếng Việt';
  const code = f.code.trim();
  if (!f.id && code && !isValidSpecOptionCode(code)) {
    errors.code = `Mã chỉ gồm chữ IN HOA không dấu, số và dấu gạch dưới (tối đa ${SPEC_OPTION_CODE_MAX} ký tự)`;
  }
  return errors;
}

export const isSpecOptionDirty = (a: SpecOptionForm, b: SpecOptionForm) =>
  JSON.stringify({ ...toSpecOptionInput(a), id: a.id }) !== JSON.stringify({ ...toSpecOptionInput(b), id: b.id });
