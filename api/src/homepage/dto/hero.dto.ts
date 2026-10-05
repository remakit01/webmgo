import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SAFE_LINK_OR_ANCHOR_PATTERN } from '@remak/shared/link';

// Màu nhấn chỉ được chọn trong bảng màu brand — FE map sang token Tailwind, không nhận mã màu tự do
export const HERO_ACCENTS = ['orange', 'green-dark', 'green', 'slate'] as const;
export type HeroAccent = (typeof HERO_ACCENTS)[number];

// Link nội bộ "/...", anchor "#..." hoặc http(s) — chặn javascript:, data:, //evil.com
const LINK_MESSAGE = 'Đường dẫn phải bắt đầu bằng "/", "#" hoặc http(s)://';

export class HeroCtaDto {
  @ApiProperty({ example: 'Nhận Mẫu Thử Miễn Phí' })
  @IsString()
  @IsNotEmpty({ message: 'Chữ trên nút không được để trống' })
  @MaxLength(40)
  text!: string;

  @ApiProperty({ example: '/nhan-mau-thu' })
  @IsString()
  @Matches(SAFE_LINK_OR_ANCHOR_PATTERN, { message: LINK_MESSAGE })
  @MaxLength(300)
  link!: string;
}

export class HeroStatDto {
  @ApiProperty({ example: '1.200°C' })
  @IsString()
  @IsNotEmpty({ message: 'Số liệu của thẻ không được để trống' })
  @MaxLength(16)
  value!: string;

  @ApiProperty({ example: 'Chịu nhiệt' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề thẻ không được để trống' })
  @MaxLength(40)
  label!: string;

  @ApiProperty({ example: 'Chống cháy A1' })
  @IsString()
  @MaxLength(60)
  sublabel!: string;

  @ApiProperty({ enum: HERO_ACCENTS })
  @IsIn(HERO_ACCENTS, { message: 'Màu nhấn phải thuộc bảng màu thương hiệu' })
  accent!: HeroAccent;
}

export class HeroMediaTextDto {
  @ApiProperty({ example: 'Cấu Trúc Tấm MGO Thực Tế' })
  @IsString()
  @MaxLength(60)
  frameTitle!: string;

  @ApiProperty({ example: 'Công Nghệ Sulfate' })
  @IsString()
  @MaxLength(40)
  badge!: string;

  @ApiProperty({ description: 'Alt text ảnh sản phẩm (SEO + accessibility)' })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả ảnh (alt) không được để trống' })
  @MaxLength(200)
  alt!: string;
}

export class UpdateHeroDto {
  @ApiProperty({ example: 'Tấm Chống Cháy MGO Remak®' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề chính không được để trống' })
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Bảo vệ kết cấu PCCC chuyên sâu' })
  @IsString()
  @MaxLength(160)
  subtitle!: string;

  @ApiProperty({ type: [String], description: '1–3 đoạn mô tả; hỗ trợ **in đậm**' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Cần ít nhất 1 đoạn mô tả' })
  @ArrayMaxSize(3, { message: 'Tối đa 3 đoạn mô tả' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true, message: 'Đoạn mô tả không được để trống' })
  @MaxLength(600, { each: true })
  paragraphs!: string[];

  @ApiProperty({ type: HeroCtaDto })
  @ValidateNested()
  @Type(() => HeroCtaDto)
  primaryCta!: HeroCtaDto;

  @ApiPropertyOptional({ type: HeroCtaDto, description: 'Bỏ trống = ẩn nút phụ' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroCtaDto)
  secondaryCta?: HeroCtaDto | null;

  @ApiProperty({ type: [HeroStatDto], description: 'Đúng 4 thẻ số liệu' })
  @IsArray()
  @ArrayMinSize(4, { message: 'Cần đúng 4 thẻ số liệu' })
  @ArrayMaxSize(4, { message: 'Cần đúng 4 thẻ số liệu' })
  @ValidateNested({ each: true })
  @Type(() => HeroStatDto)
  stats!: HeroStatDto[];

  @ApiProperty({ type: HeroMediaTextDto })
  @ValidateNested()
  @Type(() => HeroMediaTextDto)
  media!: HeroMediaTextDto;
}

// ─── Bản dịch (tiếng Anh) ─────────────────────────────────────────────────────
// Mọi trường tuỳ chọn: bỏ trống = dùng nội dung tiếng Việt tương ứng (fallback từng trường).

export const HERO_LOCALES = ['vi', 'en'] as const;
export type HeroLocale = (typeof HERO_LOCALES)[number];

export class HeroCtaTranslationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((o: HeroCtaTranslationDto) => !!o.link)
  @Matches(SAFE_LINK_OR_ANCHOR_PATTERN, { message: LINK_MESSAGE })
  @MaxLength(300)
  link?: string;
}

export class HeroStatTranslationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16)
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  sublabel?: string;
}

export class HeroMediaTranslationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  frameTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  badge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;
}

export class HeroTranslationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  subtitle?: string;

  @ApiPropertyOptional({ type: [String], description: '0–3 đoạn; rỗng = dùng các đoạn tiếng Việt' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Tối đa 3 đoạn mô tả' })
  @IsString({ each: true })
  @MaxLength(600, { each: true })
  paragraphs?: string[];

  @ApiPropertyOptional({ type: HeroCtaTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroCtaTranslationDto)
  primaryCta?: HeroCtaTranslationDto;

  @ApiPropertyOptional({ type: HeroCtaTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroCtaTranslationDto)
  secondaryCta?: HeroCtaTranslationDto;

  @ApiPropertyOptional({ type: [HeroStatTranslationDto], description: 'Theo đúng vị trí 4 thẻ tiếng Việt' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4, { message: 'Tối đa 4 thẻ số liệu' })
  @ValidateNested({ each: true })
  @Type(() => HeroStatTranslationDto)
  stats?: HeroStatTranslationDto[];

  @ApiPropertyOptional({ type: HeroMediaTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroMediaTranslationDto)
  media?: HeroMediaTranslationDto;
}

export class HeroPublicQueryDto {
  @ApiPropertyOptional({ enum: HERO_LOCALES, default: 'vi' })
  @IsOptional()
  @IsIn(HERO_LOCALES, { message: 'locale phải là vi hoặc en' })
  locale?: HeroLocale;
}
