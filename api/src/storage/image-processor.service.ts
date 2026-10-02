import { BadRequestException, Injectable } from '@nestjs/common';
import sharp, { type Metadata } from 'sharp';

export const IMAGE_WIDTHS = [480, 960, 1920] as const;
export type ImageFormat = 'webp' | 'avif';

export interface ImageVariant {
  width: number;
  format: ImageFormat;
  buffer: Buffer;
}

export interface ProcessedImage {
  /** Định dạng thật của file gốc (đọc từ nội dung, không theo đuôi/MIME client gửi) */
  sourceFormat: 'jpeg' | 'png' | 'webp' | 'avif';
  variants: ImageVariant[];
}

const ALLOWED_INPUT = new Set(['jpeg', 'png', 'webp', 'avif']);

// Banner có chữ/logo màu: giữ đủ độ phân giải kênh màu để viền chữ không bị lem
const WEBP_OPTIONS = { quality: 85, smartSubsample: true, effort: 5 } as const;
const AVIF_OPTIONS = { quality: 60, chromaSubsampling: '4:4:4', effort: 5 } as const;

@Injectable()
export class ImageProcessorService {
  /**
   * Sinh các biến thể WebP + AVIF theo từng kích thước.
   * Kiểm tra định dạng bằng nội dung file (sharp đọc header), không tin MIME client gửi.
   */
  async process(input: Buffer, options: { minWidth?: number } = {}): Promise<ProcessedImage> {
    let meta: Metadata;
    try {
      meta = await sharp(input).metadata();
    } catch {
      throw new BadRequestException('File không phải ảnh hợp lệ');
    }
    if (!meta.format || !ALLOWED_INPUT.has(meta.format) || !meta.width) {
      throw new BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc AVIF');
    }
    // Không phóng to ảnh => ảnh quá nhỏ sẽ bị trình duyệt kéo giãn và vỡ nét; chặn từ đầu
    if (options.minWidth && meta.width < options.minWidth) {
      throw new BadRequestException(
        `Ảnh quá nhỏ (${meta.width}×${meta.height}px). Cần chiều rộng tối thiểu ${options.minWidth}px`,
      );
    }

    // Không phóng to. Cỡ lớn nhất = min(ảnh gốc, 1920) để ảnh ở giữa hai mốc (vd 1500px)
    // vẫn có một biến thể đúng độ phân giải gốc thay vì bị hạ xuống 960.
    const maxWidth = Math.min(meta.width, IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]);
    const widths = [...IMAGE_WIDTHS.filter((w) => w < maxWidth), maxWidth];

    const variants: ImageVariant[] = [];
    for (const width of widths) {
      const base = sharp(input).rotate().resize({ width, withoutEnlargement: true });
      variants.push({ width, format: 'webp', buffer: await base.clone().webp(WEBP_OPTIONS).toBuffer() });
      variants.push({ width, format: 'avif', buffer: await base.clone().avif(AVIF_OPTIONS).toBuffer() });
    }
    return { sourceFormat: meta.format as ProcessedImage['sourceFormat'], variants };
  }
}
