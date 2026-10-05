import { ConflictException } from '@nestjs/common';
import { slugify, withSlugSuffix } from '@remak/shared/slug';

/**
 * Chọn slug không trùng trong phạm vi isTaken quyết định (thường là cùng locale):
 * - `explicit` (người dùng tự nhập): trùng -> 409, không tự đổi để tránh URL bất ngờ.
 * - Sinh từ tiêu đề: trùng -> thêm hậu tố -2, -3...
 */
export async function resolveUniqueSlug(options: {
  explicit?: string | null;
  fromText: string;
  isTaken: (slug: string) => Promise<boolean>;
  fallback?: string;
}): Promise<string> {
  const explicit = options.explicit?.trim();
  if (explicit) {
    if (await options.isTaken(explicit)) {
      throw new ConflictException(`Đường dẫn (slug) "${explicit}" đã được dùng, hãy chọn đường dẫn khác`);
    }
    return explicit;
  }
  const base = slugify(options.fromText) || options.fallback || 'bai-viet';
  if (!(await options.isTaken(base))) return base;
  for (let n = 2; n < 100; n++) {
    const candidate = withSlugSuffix(base, n);
    if (!(await options.isTaken(candidate))) return candidate;
  }
  throw new ConflictException('Không tạo được đường dẫn (slug) không trùng, hãy tự nhập đường dẫn');
}
