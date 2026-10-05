import { ConflictException } from '@nestjs/common';
import { CONFLICT_MESSAGE } from './site-settings.js';

/**
 * Khoá lạc quan cho bản ghi thường (không phải site_settings), dùng cột updated_at làm phiên bản:
 * 1. `assertVersion(ifMatch, row.updatedAt)` — client gửi If-Match khác phiên bản đang có -> 409 ngay.
 * 2. Ghi bằng `updateMany({ where: { ...key, updatedAt: row.updatedAt }, data })` rồi `assertUpdated(count)`:
 *    request khác chen vào giữa lúc đọc và ghi -> 0 dòng -> 409.
 * Không gửi If-Match (undefined) thì bỏ qua bước 1 nhưng bước 2 vẫn chặn ghi chồng.
 */
export function assertVersion(ifMatch: string | undefined, current: Date) {
  if (ifMatch !== undefined && ifMatch !== current.toISOString()) throw new ConflictException(CONFLICT_MESSAGE);
}

export function assertUpdated(count: number) {
  if (count === 0) throw new ConflictException(CONFLICT_MESSAGE);
}

/** Phiên bản trả về cho CMS (gửi lại qua If-Match) */
export const versionOf = (row: { updatedAt: Date }) => row.updatedAt.toISOString();
