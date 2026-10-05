import type { NewsCategoryColor } from '@remak/shared/contracts/news';

/** Màu chuyên mục Tin tức (token lưu trong DB) -> class Tailwind thương hiệu. Dùng chung CMS và site public. */
export const CATEGORY_COLOR_STYLES: Record<NewsCategoryColor, { label: string; chip: string }> = {
  green: { label: 'Xanh Remak', chip: 'bg-remak-green-light text-remak-green-dark border-remak-green/30' },
  orange: { label: 'Cam Remak', chip: 'bg-remak-orange-light text-remak-orange-dark border-remak-orange/30' },
  slate: { label: 'Xám', chip: 'bg-slate-100 text-slate-700 border-slate-300' },
  blue: { label: 'Xanh dương', chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  amber: { label: 'Vàng', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
};
