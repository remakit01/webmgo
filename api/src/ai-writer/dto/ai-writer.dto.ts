import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import {
  AI_WRITER_AUDIENCES,
  AI_WRITER_LENGTHS,
  AI_WRITER_LIMITS as L,
  type AiDraftRequest,
  type AiOutlineRequest,
  type AiResearchRequest,
  type AiWriterAudience,
  type AiWriterLength,
} from '@remak/shared/contracts/ai-writer';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const trimEach = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim() : v)).filter((v) => v !== '') : value;

/** Danh sách chuỗi ngắn (ý chính, câu hỏi, ý của mục...) */
function StringList(max: number, itemMax: number = L.itemLength) {
  return (target: object, key: string) => {
    Transform(trimEach)(target, key);
    IsArray()(target, key);
    ArrayMaxSize(max)(target, key);
    IsString({ each: true })(target, key);
    MaxLength(itemMax, { each: true })(target, key);
  };
}

class AiBaseDto {
  @ApiProperty({ example: 'tấm MGO bọc ống gió' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Nhập keyword chính' })
  @MaxLength(L.keyword)
  keyword!: string;

  @ApiPropertyOptional({ enum: AI_WRITER_AUDIENCES })
  @IsOptional()
  @IsIn(AI_WRITER_AUDIENCES)
  audience?: AiWriterAudience;

  @ApiPropertyOptional({ description: 'Ý chính / ghi chú của biên tập viên' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(L.notes)
  notes?: string;
}

export class AiSourceDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiProperty({ example: 'https://moc.gov.vn/...' })
  @IsString()
  @MaxLength(2000)
  @Matches(/^https?:\/\/\S+$/, { message: 'Link nguồn phải là http(s)' })
  url!: string;
}

export class AiResearchDto extends AiBaseDto implements AiResearchRequest {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @StringList(L.secondaryKeywords, L.keyword)
  secondaryKeywords?: string[];
}

class AiResearchContextDto extends AiBaseDto {
  @ApiProperty({ enum: AI_WRITER_LENGTHS })
  @IsIn(AI_WRITER_LENGTHS)
  length!: AiWriterLength;

  @ApiProperty({ description: 'Văn bản nghiên cứu (researchText) trả về ở bước nghiên cứu' })
  @IsString()
  @MaxLength(L.researchText)
  researchText!: string;

  @ApiProperty({ type: [AiSourceDto] })
  @IsArray()
  @ArrayMaxSize(L.sources)
  @ValidateNested({ each: true })
  @Type(() => AiSourceDto)
  sources!: AiSourceDto[];

  @ApiPropertyOptional({ type: [String], description: 'Id kiến thức nội bộ đã chọn (kho "Kiến thức AI")' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(L.knowledgeIds)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  knowledgeIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Id bài đã đăng liên quan đã chọn' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(L.articleIds)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  articleIds?: string[];
}

export class AiOutlineDto extends AiResearchContextDto implements AiOutlineRequest {
  @ApiProperty({ type: [String], description: 'Ý chính đã chọn' })
  @StringList(L.listItems)
  keyPoints!: string[];

  @ApiProperty({ type: [String], description: 'Câu hỏi đã chọn (làm mục / FAQ)' })
  @StringList(L.listItems)
  questions!: string[];
}

export class AiOutlineSectionDto {
  @ApiProperty({ enum: [2, 3] })
  @IsIn([2, 3])
  level!: 2 | 3;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề mục không được để trống' })
  @MaxLength(200)
  heading!: string;

  @ApiProperty({ type: [String] })
  @StringList(L.pointsPerSection)
  points!: string[];
}

export class AiFaqQuestionDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(L.itemLength)
  question!: string;
}

export class AiDraftDto extends AiResearchContextDto implements AiDraftRequest {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Thiếu tiêu đề bài' })
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  sapo!: string;

  @ApiProperty({ type: [AiOutlineSectionDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Dàn ý cần ít nhất một mục' })
  @ArrayMaxSize(L.sections, { message: `Dàn ý tối đa ${L.sections} mục` })
  @ValidateNested({ each: true })
  @Type(() => AiOutlineSectionDto)
  sections!: AiOutlineSectionDto[];

  @ApiProperty({ type: [AiFaqQuestionDto] })
  @IsArray()
  @ArrayMaxSize(L.faq)
  @ValidateNested({ each: true })
  @Type(() => AiFaqQuestionDto)
  faq!: AiFaqQuestionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @ApiPropertyOptional({ type: [String], description: 'Câu hỏi fan-out từ bước nghiên cứu (chấm độ phủ GEO)' })
  @IsOptional()
  @StringList(L.listItems)
  fanOutQueries?: string[];
}
