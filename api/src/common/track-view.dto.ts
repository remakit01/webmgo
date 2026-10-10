import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { LOCALES, type Locale } from '@remak/shared/locale';

/**
 * Body ghi một lượt xem (Tin tức, Sản phẩm). Trình duyệt gửi form-urlencoded (không cần preflight CORS,
 * dùng được với sendBeacon) -> mọi giá trị là chuỗi.
 */
export class TrackViewDto {
  @ApiProperty({ enum: LOCALES })
  @IsIn(LOCALES)
  locale!: Locale;

  @ApiPropertyOptional({ description: 'document.referrer' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  referrer?: string;

  @ApiPropertyOptional({ description: 'utm_source của URL trang' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utm?: string;
}
