import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_SPEC_PROFILES, PRODUCT_TYPE_LIMITS as L, type ProductSpecProfile } from '@remak/shared/contracts/product';
import { IsSlug } from '../../common/validators.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const blankNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);

export class ProductTypeTranslationDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên loại sản phẩm không được để trống' })
  @MaxLength(L.name)
  name!: string;

  @ApiPropertyOptional({ description: 'Bỏ trống = tự sinh từ tên' })
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: ProductTypeTranslationDto) => !!o.slug)
  @IsSlug()
  @MaxLength(L.slug)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(blankNull)
  @IsString()
  @MaxLength(L.description)
  description!: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(blankNull)
  @IsString()
  @MaxLength(L.seoTitle)
  seoTitle!: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(blankNull)
  @IsString()
  @MaxLength(L.seoDescription)
  seoDescription!: string | null;
}

class ProductTypeTranslationsDto {
  @ApiProperty({ type: ProductTypeTranslationDto })
  @ValidateNested()
  @Type(() => ProductTypeTranslationDto)
  vi!: ProductTypeTranslationDto;

  @ApiPropertyOptional({ type: ProductTypeTranslationDto, description: 'null = chưa có bản tiếng Anh' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductTypeTranslationDto)
  en!: ProductTypeTranslationDto | null;
}

export class UpsertProductTypeDto {
  @ApiProperty({ enum: PRODUCT_SPEC_PROFILES, description: 'Mẫu form thông số riêng' })
  @IsIn(PRODUCT_SPEC_PROFILES, { message: 'Mẫu form thông số không hợp lệ' })
  specProfile!: ProductSpecProfile;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ type: ProductTypeTranslationsDto })
  @ValidateNested()
  @Type(() => ProductTypeTranslationsDto)
  translations!: ProductTypeTranslationsDto;
}

export class ReorderProductTypesDto {
  @ApiProperty({ type: [String], description: 'TOÀN BỘ id loại theo thứ tự mới (phần tử đầu = vị trí 0)' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @ArrayUnique({ message: 'Danh sách loại bị trùng' })
  @IsString({ each: true })
  ids!: string[];
}
