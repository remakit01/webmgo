import type { Locale } from '@remak/shared/locale';
import type { ProductCms, ProductInput } from '@remak/shared/contracts/product';

/** Các phần của form — cũng là id neo cho mục lục bên phải */
export const SECTIONS = [
  { id: 'content', label: 'Nội dung' },
  { id: 'variants', label: 'Độ dày & giá' },
  { id: 'spec', label: 'Thông số kỹ thuật' },
  { id: 'extension', label: 'Thông số riêng theo loại' },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];

/** id DOM của ô theo khoá lỗi ("variants.2.priceVnd" -> "pf-variants-2-priceVnd") để focus ô sai */
export const fieldId = (path: string) => `pf-${path.replace(/\./g, '-')}`;

/** ProductCms -> phần form gửi lên API (bỏ thông tin chỉ đọc) */
export function toProductInput(p: ProductCms): ProductInput {
  return {
    productType: p.productType,
    tradeName: p.tradeName,
    isFeatured: p.isFeatured,
    translations: p.translations,
    technicalSpec: p.technicalSpec,
    variants: p.variants,
    sip: p.sip,
    floor: p.floor,
    decorative: p.decorative,
  };
}

export const isFormDirty = (a: ProductInput, b: ProductInput) => JSON.stringify(a) !== JSON.stringify(b);

/** Ô chữ tuỳ chọn: chuỗi trống lưu null */
export const blankToNull = (v: string) => (v.trim() ? v : null);

/** Lỗi nằm ở đâu: phần nào, tab ngôn ngữ nào, dòng độ dày nào (để mở đúng chỗ rồi focus) */
export function errorTarget(key: string): { section: SectionId; locale?: Locale; variant?: number } {
  const [head, second] = key.split('.');
  if (head === 'translations') return { section: 'content', locale: second as Locale };
  if (head === 'variants') return { section: 'variants', variant: second !== undefined ? Number(second) : undefined };
  if (head === 'technicalSpec') return { section: 'spec' };
  return { section: 'extension' };
}

/** Thứ tự lỗi theo vị trí trên form (focus lỗi đầu tiên) */
export function firstErrorKey(errors: Record<string, string>): string | null {
  const order: SectionId[] = SECTIONS.map((s) => s.id);
  const keys = Object.keys(errors);
  keys.sort((a, b) => order.indexOf(errorTarget(a).section) - order.indexOf(errorTarget(b).section));
  return keys[0] ?? null;
}

/** VND: 195000 -> "195.000 đ" */
export const formatVnd = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n)} đ`;
