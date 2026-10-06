import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LOCALES, type Locale } from '@remak/shared/locale';
import { PUBLISH_STATUSES, type PublishStatus } from '@remak/shared/publishing';
import { TRANSLATION_ORIGINS, type TranslationOrigin } from '@remak/shared/contracts/news';
import type { RichDoc } from '@remak/shared/rich-content';
import { PaginationQueryDto } from '../../common/pagination.dto.js';
import { IsRichDoc, IsSafeLink, IsSlug } from '../../common/validators.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : value;

/** Nội dung một ngôn ngữ của bài viết (tạo/sửa bản dịch) */
export class NewsTranslationDto {
  @ApiProperty({ example: 'Tấm MGO chống cháy cho ống gió' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ description: 'Bỏ trống = tự sinh từ tiêu đề (giữ slug cũ nếu bản dịch đã có)' })
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: NewsTranslationDto) => !!o.slug)
  @IsSlug()
  slug?: string;

  @ApiProperty({ description: 'Sapo — đoạn mở đầu in đậm, dùng cho danh sách và meta description' })
  @Transform(trim)
  @IsString()
  @MaxLength(600)
  sapo!: string;

  @ApiProperty({ description: 'Nội dung dạng RichDoc (TipTap JSON) — xem @remak/shared/rich-content', type: 'object', additionalProperties: true })
  @IsObject()
  @IsRichDoc()
  content!: RichDoc;

  @ApiPropertyOptional({ description: 'Mô tả ảnh đại diện (alt) theo ngôn ngữ' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  coverAlt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  coverCaption?: string | null;

  @ApiPropertyOptional({ description: 'Keyword chính của bài (chấm điểm SEO/AEO/GEO trong CMS)' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  focusKeyword?: string | null;

  @ApiPropertyOptional({ description: 'Bỏ trống = dùng tiêu đề' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  seoTitle?: string | null;

  @ApiPropertyOptional({ description: 'Bỏ trống = dùng sapo' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;

  @ApiPropertyOptional({ description: 'Ảnh chia sẻ mạng xã hội; bỏ trống = ảnh đại diện' })
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: NewsTranslationDto) => !!o.ogImageUrl)
  @IsSafeLink()
  @MaxLength(500)
  ogImageUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  noindex?: boolean;

  @ApiPropertyOptional({ example: 'Báo Xây Dựng', description: 'Nguồn tin: hiển thị "Theo …"' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  sourceName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: NewsTranslationDto) => !!o.sourceUrl)
  @IsSafeLink()
  @MaxLength(500)
  sourceUrl?: string | null;

  @ApiPropertyOptional({ enum: TRANSLATION_ORIGINS, description: 'Gửi "AI" khi lưu bản nháp do AI dịch' })
  @IsOptional()
  @IsIn(TRANSLATION_ORIGINS)
  origin?: TranslationOrigin;

  @ApiPropertyOptional({ description: 'Phiên bản bản tiếng Việt đã dùng để dịch (đánh dấu bản dịch đã theo kịp)' })
  @IsOptional()
  @IsISO8601()
  sourceUpdatedAt?: string;
}

/** Thông tin chung của bài (không theo ngôn ngữ) */
export class NewsPostMetaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  authorId?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Thứ tự trong khối bài nổi bật (nhỏ trước)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  featuredOrder?: number | null;
}

export class CreateNewsPostDto extends NewsPostMetaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Chưa chọn chuyên mục' })
  declare categoryId: string;

  @ApiProperty({ type: NewsTranslationDto, description: 'Bản tiếng Việt (ngôn ngữ gốc)' })
  @ValidateNested()
  @Type(() => NewsTranslationDto)
  translation!: NewsTranslationDto;
}

export class UpdateNewsPostDto extends NewsPostMetaDto {}

export class PublishNewsDto {
  @ApiPropertyOptional({ description: 'Thời điểm đăng (ISO). Tương lai = lên lịch; bỏ trống = đăng ngay' })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}

export class NewsLocaleParamDto {
  @IsString()
  id!: string;

  @IsIn(LOCALES, { message: 'Ngôn ngữ không hợp lệ' })
  locale!: Locale;
}

export class NewsPostListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PUBLISH_STATUSES })
  @IsOptional()
  @IsIn(PUBLISH_STATUSES)
  status?: PublishStatus;

  @ApiPropertyOptional({ enum: LOCALES, description: 'Lọc theo trạng thái của ngôn ngữ này (mặc định vi)' })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Chỉ bài trong thùng rác' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  trash?: boolean;

  @ApiPropertyOptional({ description: 'Chỉ bài nổi bật (sắp theo thứ tự hiển thị trên trang chủ)' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: LOCALES, description: 'Lọc bài CHƯA có bản dịch ở ngôn ngữ này' })
  @IsOptional()
  @IsIn(LOCALES)
  missing?: Locale;
}

export class SetFeaturedNewsDto {
  @ApiProperty({ type: [String], description: 'Id bài nổi bật theo đúng thứ tự hiển thị (bài không có trong danh sách bị bỏ nổi bật)' })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  ids!: string[];
}

export class SlugCheckQueryDto {
  @IsIn(LOCALES)
  locale!: Locale;

  @IsString()
  @MaxLength(200)
  slug!: string;

  @IsOptional()
  @IsString()
  excludeId?: string;
}
