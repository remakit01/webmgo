import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import {
  AI_KNOWLEDGE_KINDS,
  AI_KNOWLEDGE_LIMITS as L,
  AI_KNOWLEDGE_ORIGINS,
  AI_KNOWLEDGE_STATUSES,
  type AiKnowledgeInput,
  type AiKnowledgeKind,
  type AiKnowledgeOrigin,
  type AiKnowledgeStatus,
  type AiKnowledgeSuggestion,
} from '@remak/shared/contracts/ai-knowledge';
import { PaginationQueryDto } from '../../common/pagination.dto.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const blankToNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);
const cleanTags = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? [...new Set(value.map((v) => (typeof v === 'string' ? v.trim() : v)).filter((v) => v !== ''))] : value;

/** Link nguồn: http(s) hoặc đường dẫn nội bộ của site */
const SOURCE_URL = /^(https?:\/\/\S+|\/(?!\/)\S*)$/;

export class AiKnowledgeDto implements AiKnowledgeInput {
  @ApiProperty({ enum: AI_KNOWLEDGE_KINDS })
  @IsIn(AI_KNOWLEDGE_KINDS)
  kind!: AiKnowledgeKind;

  @ApiProperty({ example: 'Tấm MGO FireOFF 12 mm — thông số' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(L.title)
  title!: string;

  @ApiProperty({ description: 'Nội dung kiến thức (sự kiện, thông số, quy trình...) — AI đọc nguyên văn' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @MaxLength(L.content, { message: `Nội dung tối đa ${L.content} ký tự — hãy tách thành nhiều mẩu` })
  content!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(cleanTags)
  @IsArray()
  @ArrayMaxSize(L.tags)
  @IsString({ each: true })
  @MaxLength(L.tag, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(blankToNull)
  @IsString()
  @MaxLength(L.sourceUrl)
  @Matches(SOURCE_URL, { message: 'Link nguồn phải là http(s) hoặc đường dẫn nội bộ "/..."' })
  sourceUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(blankToNull)
  @IsString()
  @MaxLength(300)
  sourceTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ enum: AI_KNOWLEDGE_STATUSES })
  @IsOptional()
  @IsIn(AI_KNOWLEDGE_STATUSES)
  status?: AiKnowledgeStatus;
}

export class AiKnowledgeListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AI_KNOWLEDGE_KINDS })
  @IsOptional()
  @IsIn(AI_KNOWLEDGE_KINDS)
  kind?: AiKnowledgeKind;

  @ApiPropertyOptional({ enum: AI_KNOWLEDGE_STATUSES })
  @IsOptional()
  @IsIn(AI_KNOWLEDGE_STATUSES)
  status?: AiKnowledgeStatus;

  @ApiPropertyOptional({ enum: AI_KNOWLEDGE_ORIGINS })
  @IsOptional()
  @IsIn(AI_KNOWLEDGE_ORIGINS)
  origin?: AiKnowledgeOrigin;
}

export class AiKnowledgeSearchQueryDto {
  @ApiProperty({ example: 'tấm MGO bọc ống gió EI 60' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Nhập nội dung cần tra cứu' })
  @MaxLength(200)
  q!: string;
}

export class AiKnowledgeSuggestionDto implements AiKnowledgeSuggestion {
  @ApiProperty({ enum: AI_KNOWLEDGE_KINDS })
  @IsIn(AI_KNOWLEDGE_KINDS)
  kind!: AiKnowledgeKind;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(L.title)
  title!: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(L.content)
  content!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(L.sourceUrl)
  @Matches(/^https?:\/\/\S+$/, { message: 'Kiến thức từ web phải có link nguồn http(s)' })
  sourceUrl!: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  sourceTitle!: string;
}

export class AcceptSuggestionsDto {
  @ApiProperty({ type: [AiKnowledgeSuggestionDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AiKnowledgeSuggestionDto)
  items!: AiKnowledgeSuggestionDto[];
}
