// Tiện ích bản dịch dùng chung: ghép bản dịch lên bản gốc tiếng Việt, phát hiện bản dịch lỗi thời.

/** Dùng bản dịch nếu có nội dung (đã trim), ngược lại giữ bản gốc */
export const pickTranslated = (translated: string | null | undefined, source: string): string =>
  translated !== undefined && translated !== null && translated.trim() !== '' ? translated.trim() : source;

/**
 * Bản dịch lỗi thời khi bản gốc được sửa SAU thời điểm dịch.
 * `translatedFrom` là updatedAt của bản gốc tại lúc dịch; chưa có thì không coi là lỗi thời.
 */
export function isTranslationStale(
  sourceUpdatedAt: string | Date,
  translatedFrom: string | Date | null | undefined,
): boolean {
  if (!translatedFrom) return false;
  return new Date(sourceUpdatedAt).getTime() > new Date(translatedFrom).getTime();
}
