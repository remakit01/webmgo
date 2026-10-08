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
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CORE_COLORS,
  CRYSTAL_PHASES,
  DECORATIVE_FINISH_TYPES,
  EDGE_PROFILES,
  LOAD_BEARING_TYPES,
  PRICE_MODES,
  PRODUCT_LIMITS as L,
  PRODUCT_PUBLISH_STATUSES,
  SALE_UNITS,
  SCRATCH_RESISTANCES,
  SCREW_HOLDING_RATINGS,
  SIP_CORE_MATERIALS,
  STOCK_STATUSES,
  SUITABLE_FLOORINGS,
  SURFACE_FINISHES,
  VOC_LEVELS,
  type DecorativeFinishType,
  type EdgeProfile,
  type PriceMode,
  type ProductPublishStatus,
  type SaleUnit,
  type SipCoreMaterial,
  type StockStatus,
} from '@remak/shared/contracts/product';
import { IsSlug } from '../../common/validators.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
/** "" -> null cho trường tuỳ chọn */
const blankNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);

class SheetSizeDto {
  @IsInt() @Min(1) @Max(20000) widthMm!: number;
  @IsInt() @Min(1) @Max(20000) lengthMm!: number;
}

class TitledItemDto {
  @Transform(trim) @IsString() @MaxLength(L.listItemText) title!: string;
  @Transform(trim) @IsString() @MaxLength(L.listItemText) desc!: string;
}

class FaqItemDto {
  @Transform(trim) @IsString() @MaxLength(L.listItemText) q!: string;
  @Transform(trim) @IsString() @MaxLength(2000) a!: string;
}

class ExtraSpecDto {
  @Transform(trim) @IsString() @Matches(/^[a-z0-9_]{1,60}$/) key!: string;
  @Transform(trim) @IsString() @MaxLength(200) value!: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(20) unit?: string;
}

export class ProductTranslationDto {
  @IsIn(PRODUCT_PUBLISH_STATUSES) status!: ProductPublishStatus;
  @Transform(trim) @IsString() @MaxLength(L.name) name!: string;
  @ApiPropertyOptional({ description: 'Bỏ trống = tự sinh từ tên' })
  @IsOptional()
  @Transform(blankNull)
  @IsSlug()
  @MaxLength(L.slug)
  slug!: string | null;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(L.tagline) tagline!: string | null;
  @Transform(trim) @IsString() @MaxLength(L.summary) summary!: string;
  @ApiProperty({ description: 'RichDoc (@remak/shared/rich-content) — kiểm bằng validateRichDoc ở service' })
  @IsObject()
  description!: unknown;
  @IsArray() @ArrayMaxSize(L.listItems) @IsString({ each: true }) @MaxLength(L.listItemText, { each: true }) highlights!: string[];
  @IsArray() @ArrayMaxSize(L.listItems) @ValidateNested({ each: true }) @Type(() => TitledItemDto) advantages!: TitledItemDto[];
  @IsArray() @ArrayMaxSize(L.listItems) @ValidateNested({ each: true }) @Type(() => FaqItemDto) faqs!: FaqItemDto[];
  @Transform(trim) @IsString() @MaxLength(300) coverAlt!: string;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(L.seoTitle) seoTitle!: string | null;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(L.seoDescription) seoDescription!: string | null;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(120) focusKeyword!: string | null;
  @IsBoolean() noindex!: boolean;
}

class ProductTranslationsDto {
  @ValidateNested() @Type(() => ProductTranslationDto) vi!: ProductTranslationDto;
  @IsOptional() @ValidateNested() @Type(() => ProductTranslationDto) en!: ProductTranslationDto | null;
}

/** Số tuỳ chọn ≥ 0 */
const OptNum = (max: number) => (target: object, key: string) => {
  IsOptional()(target, key);
  IsNumber({ maxDecimalPlaces: 4 })(target, key);
  Min(0)(target, key);
  Max(max)(target, key);
};
const OptInt = (max: number) => (target: object, key: string) => {
  IsOptional()(target, key);
  IsInt()(target, key);
  Min(0)(target, key);
  Max(max)(target, key);
};

export class TechnicalSpecDto {
  @IsArray() @ArrayMaxSize(10) @ValidateNested({ each: true }) @Type(() => SheetSizeDto) standardSizes!: SheetSizeDto[];
  @IsOptional() @IsIn(EDGE_PROFILES) edgeProfile!: EdgeProfile | null;
  @IsOptional() @IsIn(CORE_COLORS) coreColor!: string | null;
  @IsOptional() @IsIn(SURFACE_FINISHES) surfaceFinish!: string | null;
  @OptInt(5000) densityMinKgM3!: number | null;
  @OptInt(5000) densityMaxKgM3!: number | null;
  @OptNum(100) densityReductionPct!: number | null;
  @OptNum(1000) flexuralMinMpa!: number | null;
  @OptNum(1000) flexuralMaxMpa!: number | null;
  @OptNum(1000) flexuralCrossMinMpa!: number | null;
  @IsOptional() @IsIn(SCREW_HOLDING_RATINGS) screwHoldingRating!: string | null;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(20) reactionToFireClass!: string | null;
  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(80, { each: true }) fireClassStandards!: string[];
  @OptInt(5000) maxTemperatureC!: number | null;
  @OptNum(10) thermalConductivityWmk!: number | null;
  @OptInt(200) soundReductionMinDb!: number | null;
  @OptInt(200) soundReductionMaxDb!: number | null;
  @OptNum(100) waterAbsorptionMaxPct!: number | null;
  @OptNum(100) thicknessSwellingMaxPct!: number | null;
  @IsOptional() @IsBoolean() moldResistant!: boolean | null;
  @IsOptional() @IsIn(CRYSTAL_PHASES) crystalPhase!: string | null;
  @OptNum(100) mgoContentMinPct!: number | null;
  @OptNum(100) chlorideMaxPct!: number | null;
  @IsOptional() @IsBoolean() asbestosFree!: boolean | null;
  @OptNum(1000) formaldehydeMgL!: number | null;
  @IsOptional() @IsIn(VOC_LEVELS) vocLevel!: string | null;
  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(60, { each: true }) greenCertifications!: string[];
  @IsArray() @ArrayMaxSize(40) @ValidateNested({ each: true }) @Type(() => ExtraSpecDto) extraSpecs!: ExtraSpecDto[];
}

class VariantTranslationDto {
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(80) label!: string | null;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(300) recommendedUse!: string | null;
}

class VariantTranslationsDto {
  @IsOptional() @ValidateNested() @Type(() => VariantTranslationDto) vi?: VariantTranslationDto;
  @IsOptional() @ValidateNested() @Type(() => VariantTranslationDto) en?: VariantTranslationDto;
}

export class ProductVariantDto {
  @IsOptional() @IsString() @MaxLength(40) id!: string | null;
  @IsOptional() @Transform(blankNull) @IsString() @Matches(/^[A-Za-z0-9._-]{1,60}$/, { message: 'SKU chỉ gồm chữ, số, . _ -' }) sku!: string | null;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.5) @Max(500) thicknessMm!: number;
  @IsInt() @Min(1) @Max(20000) widthMm!: number;
  @IsInt() @Min(1) @Max(20000) lengthMm!: number;
  @OptNum(10000) weightKg!: number | null;
  @OptInt(5000) densityKgM3!: number | null;
  @OptInt(600) fireRatingMinMinutes!: number | null;
  @OptInt(600) fireRatingMaxMinutes!: number | null;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(60) fireRatingLabel!: string | null;
  @OptNum(1000) flexuralMinMpa!: number | null;
  @IsBoolean() isPopular!: boolean;
  @IsBoolean() isDefault!: boolean;
  @IsBoolean() isActive!: boolean;
  @IsIn(PRICE_MODES) priceMode!: PriceMode;
  @OptInt(2_000_000_000) priceVnd!: number | null;
  @OptInt(2_000_000_000) compareAtPriceVnd!: number | null;
  @IsIn(SALE_UNITS) saleUnit!: SaleUnit;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) priceValidUntil!: string | null;
  @IsIn(STOCK_STATUSES) stockStatus!: StockStatus;
  @OptInt(3650) leadTimeDays!: number | null;
  @OptInt(1_000_000) minOrderQty!: number | null;
  @ValidateNested() @Type(() => VariantTranslationsDto) translations!: VariantTranslationsDto;
}

class SipSpecDto {
  @IsArray() @ArrayUnique() @IsIn(SIP_CORE_MATERIALS, { each: true }) coreMaterials!: SipCoreMaterial[];
  @OptInt(2000) coreThicknessMinMm!: number | null;
  @OptInt(2000) coreThicknessMaxMm!: number | null;
  @IsArray() @ArrayMaxSize(10) @IsInt({ each: true }) @Min(1, { each: true }) @Max(200, { each: true }) facingThicknessesMm!: number[];
  @OptInt(20000) maxWidthMm!: number | null;
  @OptInt(20000) maxLengthMm!: number | null;
  @IsOptional() @IsIn(LOAD_BEARING_TYPES) loadBearing!: string | null;
}

class FloorSpecDto {
  @IsArray() @ArrayUnique() @IsIn(EDGE_PROFILES, { each: true }) edgeProfiles!: EdgeProfile[];
  @IsArray() @ArrayMaxSize(10) @ValidateNested({ each: true }) @Type(() => SheetSizeDto) floorSizes!: SheetSizeDto[];
  @IsArray() @ArrayUnique() @IsIn(SUITABLE_FLOORINGS, { each: true }) suitableFloorings!: string[];
  @IsOptional() @IsBoolean() moistureResistantFloor!: boolean | null;
  @IsOptional() @IsBoolean() sandedSurface!: boolean | null;
}

class DecorativeOptionTranslationDto {
  @Transform(trim) @IsString() @MaxLength(120) name!: string;
  @IsOptional() @Transform(blankNull) @IsString() @MaxLength(1000) description!: string | null;
  @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(120, { each: true }) patterns!: string[];
  @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(120, { each: true }) suitableAreas!: string[];
}

class DecorativeOptionTranslationsDto {
  @ValidateNested() @Type(() => DecorativeOptionTranslationDto) vi!: DecorativeOptionTranslationDto;
  @IsOptional() @ValidateNested() @Type(() => DecorativeOptionTranslationDto) en?: DecorativeOptionTranslationDto;
}

class DecorativeOptionDto {
  @IsIn(DECORATIVE_FINISH_TYPES) finishType!: DecorativeFinishType;
  @IsOptional() @IsIn(SCRATCH_RESISTANCES) scratchResistance!: string | null;
  @ValidateNested() @Type(() => DecorativeOptionTranslationsDto) translations!: DecorativeOptionTranslationsDto;
}

class DecorativeSpecDto {
  @IsBoolean() customPrintSupported!: boolean;
  @IsArray() @ArrayMaxSize(DECORATIVE_FINISH_TYPES.length) @ValidateNested({ each: true }) @Type(() => DecorativeOptionDto) options!: DecorativeOptionDto[];
}

/** Body tạo / sửa sản phẩm — cùng hình dạng ProductInput (@remak/shared/contracts/product) */
export class ProductInputDto {
  @IsString() @IsNotEmpty({ message: 'Chọn loại sản phẩm' }) typeId!: string;
  @IsBoolean() isFeatured!: boolean;
  @ValidateNested() @Type(() => ProductTranslationsDto) translations!: ProductTranslationsDto;
  @ValidateNested() @Type(() => TechnicalSpecDto) technicalSpec!: TechnicalSpecDto;
  @IsArray() @ArrayMaxSize(L.variants) @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants!: ProductVariantDto[];
  @IsOptional() @ValidateNested() @Type(() => SipSpecDto) sip!: SipSpecDto | null;
  @IsOptional() @ValidateNested() @Type(() => FloorSpecDto) floor!: FloorSpecDto | null;
  @IsOptional() @ValidateNested() @Type(() => DecorativeSpecDto) decorative!: DecorativeSpecDto | null;
}

export class ReorderProductsDto {
  @ApiProperty({ type: [String], description: 'TOÀN BỘ id sản phẩm (chưa xoá) theo thứ tự mới' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}
