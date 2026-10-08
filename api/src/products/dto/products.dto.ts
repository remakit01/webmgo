import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@remak/shared/locale';

export class ProductLocaleQueryDto {
  @ApiPropertyOptional({ enum: LOCALES, default: DEFAULT_LOCALE })
  @IsOptional()
  @IsIn(LOCALES)
  locale: Locale = DEFAULT_LOCALE;
}
