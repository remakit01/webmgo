import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { ImageProcessorService } from './image-processor.service.js';

const makeImage = (width: number, format: 'png' | 'jpeg' = 'png') =>
  sharp({ create: { width, height: Math.round(width / 3), channels: 3, background: '#7CB305' } })
    [format]()
    .toBuffer();

describe('ImageProcessorService', () => {
  const service = new ImageProcessorService();

  it('sinh 3 cỡ x WebP + AVIF cho ảnh lớn', async () => {
    const { variants, sourceFormat } = await service.process(await makeImage(2400));
    expect(sourceFormat).toBe('png');
    const keys = variants.map((v) => `${v.width}.${v.format}`).sort();
    expect(keys).toEqual(['1920.avif', '1920.webp', '480.avif', '480.webp', '960.avif', '960.webp']);
    const meta = await sharp(variants.find((v) => v.width === 960 && v.format === 'webp')!.buffer).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(960);
  });

  it('không phóng to; cỡ lớn nhất giữ đúng độ phân giải gốc', async () => {
    const { variants, sourceFormat } = await service.process(await makeImage(1500, 'jpeg'));
    expect(sourceFormat).toBe('jpeg');
    expect(new Set(variants.map((v) => v.width))).toEqual(new Set([480, 960, 1500]));
    const { variants: tiny } = await service.process(await makeImage(200));
    expect(new Set(tiny.map((v) => v.width))).toEqual(new Set([200]));
  });

  it('từ chối file không phải ảnh', async () => {
    await expect(service.process(Buffer.from('%PDF-1.7 not an image'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
