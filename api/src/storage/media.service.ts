import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PRIVATE_PREFIX, StorageService } from './storage.service.js';
import { ImageProcessorService } from './image-processor.service.js';

export interface StoredVariant {
  width: number;
  format: 'webp' | 'avif';
  url: string;
}

export interface UploadedImage {
  /** Prefix object trong MinIO (vd: banners/<uuid>) — dùng để dọn khi xoá/thay ảnh */
  imageKey: string;
  /** Biến thể WebP lớn nhất — fallback cho <img src> */
  imageUrl: string;
  images: StoredVariant[];
}

/**
 * Upload ảnh dùng chung cho mọi module (banner, hero...): sharp -> biến thể WebP/AVIF -> MinIO.
 * Mỗi lần upload dùng prefix mới nên URL luôn mới (cache immutable).
 * File gốc lưu riêng dưới `private/` (không công khai) để sau này tạo lại biến thể khi đổi cỡ/chất lượng.
 */
@Injectable()
export class MediaService {
  constructor(
    private readonly storage: StorageService,
    private readonly images: ImageProcessorService,
  ) {}

  /** @param prefix thư mục public, phải nằm trong PUBLIC_PREFIXES của StorageService (vd 'banners') */
  async uploadImage(prefix: string, input: Buffer, options: { minWidth?: number } = {}): Promise<UploadedImage> {
    const { sourceFormat, variants } = await this.images.process(input, options);
    const imageKey = `${prefix}/${randomUUID()}`;
    const stored: StoredVariant[] = [];
    try {
      await this.storage.putObject(
        `${PRIVATE_PREFIX}${imageKey}/original.${sourceFormat === 'jpeg' ? 'jpg' : sourceFormat}`,
        input,
        `image/${sourceFormat}`,
      );
      for (const v of variants) {
        const url = await this.storage.putObject(`${imageKey}/${v.width}.${v.format}`, v.buffer, `image/${v.format}`);
        stored.push({ width: v.width, format: v.format, url });
      }
    } catch (err) {
      await this.removeImage(imageKey);
      throw err;
    }
    const fallback = stored.filter((s) => s.format === 'webp').sort((a, b) => b.width - a.width)[0];
    return { imageKey, imageUrl: fallback.url, images: stored };
  }

  /** Xoá cả biến thể public lẫn file gốc private; lỗi dọn dẹp không chặn nghiệp vụ. */
  async removeImage(imageKey: string) {
    await Promise.all([
      this.storage.deletePrefix(`${imageKey}/`),
      this.storage.deletePrefix(`${PRIVATE_PREFIX}${imageKey}/`),
    ]).catch(() => undefined);
  }
}
