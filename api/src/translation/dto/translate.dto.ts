import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsString,
  MaxLength,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export const TRANSLATE_CONTEXTS = ['homepage-hero', 'news-article', 'product-catalog', 'general'] as const;
export type TranslateContext = (typeof TRANSLATE_CONTEXTS)[number];

export const MAX_FIELDS = 60;
export const MAX_FIELD_LENGTH = 1000;
export const MAX_TOTAL_LENGTH = 8000;

/** fields phải là { khoá: chuỗi } trong giới hạn số ô / độ dài (chặn lạm dụng chi phí gọi LLM) */
function IsTranslatableFields(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isTranslatableFields',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
          const entries = Object.entries(value as Record<string, unknown>);
          if (entries.length === 0 || entries.length > MAX_FIELDS) return false;
          let total = 0;
          for (const [key, text] of entries) {
            if (typeof text !== 'string' || key.length > 100 || text.length > MAX_FIELD_LENGTH) return false;
            total += text.length;
          }
          return total <= MAX_TOTAL_LENGTH;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}: cần 1–${MAX_FIELDS} ô dạng chuỗi, mỗi ô ≤ ${MAX_FIELD_LENGTH} ký tự, tổng ≤ ${MAX_TOTAL_LENGTH} ký tự`;
        },
      },
    });
}

export class TranslateDto {
  @ApiProperty({ enum: ['vi'] })
  @IsIn(['vi'], { message: 'Hiện chỉ hỗ trợ dịch từ tiếng Việt' })
  source!: 'vi';

  @ApiProperty({ enum: ['en'] })
  @IsIn(['en'], { message: 'Hiện chỉ hỗ trợ dịch sang tiếng Anh' })
  target!: 'en';

  @ApiProperty({ enum: TRANSLATE_CONTEXTS, description: 'Ngữ cảnh nội dung để chọn văn phong' })
  @IsString()
  @MaxLength(40)
  @IsIn(TRANSLATE_CONTEXTS)
  context!: TranslateContext;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { title: 'Tấm Chống Cháy MGO Remak®', 'stats.0.label': 'Chịu nhiệt' },
  })
  @IsObject()
  @IsTranslatableFields()
  fields!: Record<string, string>;
}
