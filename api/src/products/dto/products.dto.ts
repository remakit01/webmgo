import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@remak/shared/locale';
import { PRODUCT_STATS_DAYS } from '@remak/shared/contracts/product-stats';

export class ProductLocaleQueryDto {
  @ApiPropertyOptional({ enum: LOCALES, default: DEFAULT_LOCALE })
  @IsOptional()
  @IsIn(LOCALES)
  locale: Locale = DEFAULT_LOCALE;
}

export class ProductStatsQueryDto {
  @ApiPropertyOptional({ enum: PRODUCT_STATS_DAYS, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsIn(PRODUCT_STATS_DAYS)
  days?: number;
}
