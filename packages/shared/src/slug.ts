// Slug URL dùng chung: api sinh/kiểm tra slug, CMS xem trước slug khi gõ tiêu đề.

export const SLUG_MAX_LENGTH = 120;

/** Chỉ chữ thường không dấu, số và gạch nối đơn (không ở đầu/cuối) */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Cắt chuỗi slug tối đa maxLength ký tự, ưu tiên cắt ở ranh giới từ */
function truncate(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > maxLength / 2 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '');
}

/**
 * Sinh slug từ tiêu đề (tiếng Việt hoặc tiếng Anh):
 * "Tôi là ABC – Đặc tính MGO!" → "toi-la-abc-dac-tinh-mgo".
 */
export function slugify(input: string, maxLength = SLUG_MAX_LENGTH): string {
  const slug = input
    .replace(/[đĐ]/g, 'd') // NFD không tách được "đ" nên đổi tay
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh, dấu mũ
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return truncate(slug, maxLength);
}

export const isValidSlug = (slug: string): boolean =>
  slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);

/** Thêm hậu tố số để slug không trùng: ("abc", 2) → "abc-2", vẫn giữ trong giới hạn độ dài */
export function withSlugSuffix(slug: string, n: number, maxLength = SLUG_MAX_LENGTH): string {
  const suffix = `-${n}`;
  return `${truncate(slug, maxLength - suffix.length)}${suffix}`;
}
