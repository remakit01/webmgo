/**
 * Từ khoá người dùng -> mẫu "chứa" cho LIKE ... ESCAPE '\': thoát % _ \ để chúng được tìm đúng nghĩa đen
 * (gõ "50%" không thành "mọi thứ bắt đầu bằng 50"). Rỗng / chỉ khoảng trắng -> null.
 *
 * Dùng với hàm SQL public.search_normalize() (migration 20261009000000_news_title_search) để tìm
 * không phân biệt hoa thường và dấu tiếng Việt:
 *   WHERE public.search_normalize(col) LIKE public.search_normalize(${pattern}) ESCAPE '\'
 */
export function likeContainsPattern(input: string | null | undefined): string | null {
  const q = input?.trim().replace(/\s+/g, ' ');
  if (!q) return null;
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
