import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

// Chỉ cho phép link nội bộ ("/...") hoặc http(s) — chặn javascript:, data:, //evil.com
const LINK_PATTERN = /^(\/(?!\/)|https?:\/\/)\S*$/;
const LINK_MESSAGE = 'linkUrl phải là đường dẫn nội bộ hoặc http(s) URL';

// multipart gửi mọi field dạng chuỗi
const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : value;

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Alt text của ảnh (SEO + accessibility)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  alt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaText?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn nội bộ hoặc http(s) URL; chuỗi rỗng = xoá link' })
  @IsOptional()
  @ValidateIf((o: CreateBannerDto) => !!o.linkUrl)
  @Matches(LINK_PATTERN, { message: LINK_MESSAGE })
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBannerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o: UpdateBannerDto) => !!o.linkUrl)
  @Matches(LINK_PATTERN, { message: LINK_MESSAGE })
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderBannersDto {
  @ApiProperty({ type: [String], description: 'Danh sách id theo thứ tự hiển thị mới' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];
}

export class SwiperSettingsDto {
  @ApiProperty({ description: 'Thời gian tự chuyển slide (ms)' })
  @IsInt()
  @Min(1000)
  @Max(30000)
  autoPlayInterval!: number;

  @ApiProperty()
  @IsBoolean()
  pauseOnHover!: boolean;

  @ApiProperty()
  @IsBoolean()
  showDots!: boolean;
}

export class TrashSettingsDto {
  @ApiProperty({ description: 'Bật job tự dọn thùng rác lúc 03:00 hằng ngày (giờ Việt Nam)' })
  @IsBoolean()
  autoPurgeEnabled!: boolean;

  @ApiProperty({ description: 'Số ngày giữ banner trong thùng rác trước khi đủ hạn xoá vĩnh viễn' })
  @IsInt()
  @Min(1)
  @Max(365)
  retentionDays!: number;
}
