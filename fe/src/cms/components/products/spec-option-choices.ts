// Lựa chọn cho ô thông số lấy từ danh mục (CMS "Danh Mục Thông Số") — hàm thuần.

import type { SpecOptionCms, SpecOptionGroup } from '@remak/shared/contracts/product';

export type Choice = { value: string; label: string };

/**
 * Giá trị đang bật của nhóm (đúng thứ tự CMS) + giá trị sản phẩm đang dùng mà đã tắt / không còn
 * (giữ để không mất dữ liệu khi lưu, đánh dấu "(đang ẩn)").
 */
export function choicesFor(options: SpecOptionCms[], group: SpecOptionGroup, current: string | readonly string[] | null | undefined): Choice[] {
  const inGroup = options.filter((o) => o.group === group);
  const used = new Set(current == null ? [] : typeof current === 'string' ? [current] : current);
  const out: Choice[] = inGroup
    .filter((o) => o.isActive || used.has(o.code))
    .map((o) => ({ value: o.code, label: `${o.labels.vi ?? o.code}${o.isActive ? '' : ' (đang ẩn)'}` }));
  for (const code of used) {
    if (!inGroup.some((o) => o.code === code)) out.push({ value: code, label: `${code} (không còn trong danh mục)` });
  }
  return out;
}

/** Nhãn tiếng Việt của mã (thiếu -> chính mã) */
export const choiceLabel = (options: SpecOptionCms[], group: SpecOptionGroup, code: string) =>
  options.find((o) => o.group === group && o.code === code)?.labels.vi ?? code;
