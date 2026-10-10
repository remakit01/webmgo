import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { LOCALES, type Locale } from '@remak/shared/locale';
import { NEWS_STATS_DAYS } from '@remak/shared/contracts/news-stats';
import { TrackViewDto } from '../../common/track-view.dto.js';

export { TrackViewDto };

// Trình duyệt gửi dạng form-urlencoded (không cần preflight CORS, dùng được với sendBeacon) -> mọi giá trị là chuỗi
const toBool = ({ value }: { value: unknown }) => value === true || value === 'true' || value === '1';

export class TrackReadDto extends TrackViewDto {
  @ApiProperty({ description: 'Số giây đọc thật (tab đang mở) — server kẹp ≤ 30 phút' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(86_400)
  seconds!: number;

  @ApiPropertyOptional({ description: 'Đã đọc tới 75% bài' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  completed?: boolean;
}

export class PopularQueryDto {
  @ApiProperty({ enum: LOCALES })
  @IsIn(LOCALES)
  locale!: Locale;

  @ApiPropertyOptional({ enum: [1, 7, 30], default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 7, 30])
  days?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;
}

export class StatsQueryDto {
  @ApiPropertyOptional({ enum: NEWS_STATS_DAYS, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsIn(NEWS_STATS_DAYS)
  days?: number;
}

export class PostStatsQueryDto extends StatsQueryDto {
  @ApiPropertyOptional({ enum: LOCALES, default: 'vi' })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;
}
