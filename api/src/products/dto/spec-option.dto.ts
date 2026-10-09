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
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SPEC_OPTION_CODE_MAX, SPEC_OPTION_GROUPS, SPEC_OPTION_LABEL_MAX, type SpecOptionGroup } from '@remak/shared/contracts/product';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const blankNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);
const CODE_MESSAGE = 'Mã chỉ gồm chữ IN HOA không dấu, số và dấu gạch dưới (vd PHASE_517)';

class SpecOptionLabelsDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Nhập nhãn tiếng Việt' })
  @MaxLength(SPEC_OPTION_LABEL_MAX)
  vi!: string;

  @ApiPropertyOptional({ description: 'null = web /en dùng nhãn tiếng Việt' })
  @IsOptional()
  @Transform(blankNull)
  @IsString()
  @MaxLength(SPEC_OPTION_LABEL_MAX)
  en!: string | null;
}

/** Sửa giá trị: nhãn + bật/tắt. `code` chỉ để API báo lỗi nếu ai đó cố đổi mã */
export class UpdateSpecOptionDto {
  @ApiPropertyOptional({ description: 'Không đổi được — gửi khác mã hiện tại sẽ bị từ chối' })
  @IsOptional()
  @Transform(trim)
  @ValidateIf((o: UpdateSpecOptionDto) => !!o.code)
  @MaxLength(SPEC_OPTION_CODE_MAX)
  @Matches(/^[A-Z0-9]+(_[A-Z0-9]+)*$/, { message: CODE_MESSAGE })
  code?: string;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ type: SpecOptionLabelsDto })
  @ValidateNested()
  @Type(() => SpecOptionLabelsDto)
  labels!: SpecOptionLabelsDto;
}

export class CreateSpecOptionDto extends UpdateSpecOptionDto {
  @ApiProperty({ enum: SPEC_OPTION_GROUPS })
  @IsIn(SPEC_OPTION_GROUPS, { message: 'Nhóm danh mục không hợp lệ' })
  group!: SpecOptionGroup;
}

export class ReorderSpecOptionsDto {
  @ApiProperty({ enum: SPEC_OPTION_GROUPS })
  @IsIn(SPEC_OPTION_GROUPS, { message: 'Nhóm danh mục không hợp lệ' })
  group!: SpecOptionGroup;

  @ApiProperty({ type: [String], description: 'TOÀN BỘ id giá trị của nhóm theo thứ tự mới' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @ArrayUnique({ message: 'Danh sách giá trị bị trùng' })
  @IsString({ each: true })
  ids!: string[];
}
