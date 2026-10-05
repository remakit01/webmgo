import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@remak/shared/locale';
import { PAGE_SIZE_MAX } from '@remak/shared/pagination';

const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : value;

export class NewsLocaleQueryDto {
  @ApiPropertyOptional({ enum: LOCALES, default: DEFAULT_LOCALE })
  @IsOptional()
  @IsIn(LOCALES)
  locale: Locale = DEFAULT_LOCALE;
}

export class NewsPublicListQueryDto extends NewsLocaleQueryDto {
  @ApiPropertyOptional({ description: 'Slug chuyên mục (theo ngôn ngữ đang xem)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @ApiPropertyOptional({ description: 'Slug tag (theo ngôn ngữ đang xem)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tag?: string;

  @ApiPropertyOptional({ description: 'Chỉ bài nổi bật (sắp theo thứ tự nổi bật)' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: PAGE_SIZE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGE_SIZE_MAX)
  pageSize?: number;
}
