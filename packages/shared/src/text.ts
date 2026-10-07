/**
 * Chuẩn hoá chữ để so khớp / tìm kiếm: bỏ dấu tiếng Việt (đ -> d), chữ thường, gộp khoảng trắng.
 * Cho kết quả như hàm SQL public.search_normalize() (unaccent + lower) với chữ tiếng Việt —
 * dùng phía client (vd phát hiện tag trùng "Chống cháy" ~ "chong chay").
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
