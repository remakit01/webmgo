import { ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';

/**
 * Ghi site_settings có khoá lạc quan (optimistic locking) theo cột updated_at:
 * - Client gửi phiên bản đang sửa qua header `If-Match` (= updatedAt ISO nhận được lúc GET).
 * - Ghi bằng `UPDATE ... WHERE key = ? AND updated_at = ?`: nếu người khác đã lưu trước -> 0 dòng -> 409.
 * Không giữ khoá trong DB (transaction ngắn), và chặn luôn trường hợp 2 request chen nhau giữa lúc đọc và ghi.
 */

export const CONFLICT_MESSAGE =
  'Nội dung đã được người khác cập nhật trong lúc bạn đang sửa. Hãy tải lại để xem bản mới nhất rồi lưu lại.';

/** `If-Match: "2026-10-03T01:02:03.456Z"` hoặc `W/"..."` -> chuỗi ISO; không gửi -> undefined (bỏ qua kiểm tra) */
export function parseIfMatch(header: string | undefined): string | undefined {
  if (!header || header.trim() === '' || header.trim() === '*') return undefined;
  return header.trim().replace(/^W\//, '').replace(/^"|"$/g, '');
}

export interface SettingRow<T> {
  value: T;
  version: string;
}

export async function readSetting<T>(prisma: PrismaService, key: string): Promise<SettingRow<T> | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row ? { value: row.value as T, version: row.updatedAt.toISOString() } : null;
}

/**
 * Tính giá trị mới từ giá trị hiện tại rồi ghi có điều kiện phiên bản.
 * @returns giá trị trước khi ghi (để caller dọn dẹp, vd xoá ảnh cũ) và giá trị mới
 */
export async function saveSettingVersioned<T, P = T>(
  prisma: PrismaService,
  key: string,
  compute: (current: P | undefined) => T,
  ifMatch: string | undefined,
): Promise<{ previous: P | undefined; value: T }> {
  const current = await readSetting<P>(prisma, key);
  if (ifMatch !== undefined && ifMatch !== (current?.version ?? '')) throw new ConflictException(CONFLICT_MESSAGE);

  const value = compute(current?.value);
  if (!current) {
    try {
      await prisma.siteSetting.create({ data: { key, value: value as object } });
    } catch {
      // Người khác vừa tạo cùng key (vi phạm khoá chính)
      throw new ConflictException(CONFLICT_MESSAGE);
    }
  } else {
    const { count } = await prisma.siteSetting.updateMany({
      where: { key, updatedAt: new Date(current.version) },
      data: { value: value as object },
    });
    if (count === 0) throw new ConflictException(CONFLICT_MESSAGE);
  }
  return { previous: current?.value, value };
}
