import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { NEWS_CATEGORY_COLORS, type NewsCategoryColor } from '@remak/shared/contracts/news';
import { IsSafeLink, IsSlug } from '../../common/validators.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

class SluggedNameDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Bỏ trống = tự sinh từ tên' })
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: SluggedNameDto) => !!o.slug)
  @IsSlug()
  slug?: string;
}

// ─── Chuyên mục ──────────────────────────────────────────────────────────────

export class CategoryTranslationDto extends SluggedNameDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  seoTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;
}

class CategoryTranslationsDto {
  @ApiProperty({ type: CategoryTranslationDto })
  @ValidateNested()
  @Type(() => CategoryTranslationDto)
  vi!: CategoryTranslationDto;

  @ApiPropertyOptional({ type: CategoryTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryTranslationDto)
  en?: CategoryTranslationDto | null;
}

export class UpsertNewsCategoryDto {
  @ApiProperty({ enum: NEWS_CATEGORY_COLORS })
  @IsIn(NEWS_CATEGORY_COLORS, { message: 'Màu chuyên mục không hợp lệ' })
  color!: NewsCategoryColor;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: CategoryTranslationsDto })
  @ValidateNested()
  @Type(() => CategoryTranslationsDto)
  translations!: CategoryTranslationsDto;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export class TagTranslationDto extends SluggedNameDto {}

class TagTranslationsDto {
  @ApiProperty({ type: TagTranslationDto })
  @ValidateNested()
  @Type(() => TagTranslationDto)
  vi!: TagTranslationDto;

  @ApiPropertyOptional({ type: TagTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TagTranslationDto)
  en?: TagTranslationDto | null;
}

export class UpsertNewsTagDto {
  @ApiProperty({ type: TagTranslationsDto })
  @ValidateNested()
  @Type(() => TagTranslationsDto)
  translations!: TagTranslationsDto;
}

// ─── Tác giả ─────────────────────────────────────────────────────────────────

export class AuthorTranslationDto {
  @ApiPropertyOptional({ example: 'Kỹ sư PCCC' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  jobTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  bio?: string | null;
}

class AuthorTranslationsDto {
  @ApiPropertyOptional({ type: AuthorTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthorTranslationDto)
  vi?: AuthorTranslationDto | null;

  @ApiPropertyOptional({ type: AuthorTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthorTranslationDto)
  en?: AuthorTranslationDto | null;
}

export class UpsertNewsAuthorDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên tác giả không được để trống' })
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: UpsertNewsAuthorDto) => !!o.avatarUrl)
  @IsSafeLink()
  @MaxLength(500)
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: AuthorTranslationsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthorTranslationsDto)
  translations?: AuthorTranslationsDto;
}
