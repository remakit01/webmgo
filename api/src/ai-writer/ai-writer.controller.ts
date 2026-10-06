import { Body, Controller, HttpCode, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import type { AiDraftEvent, AiResearchEvent } from '@remak/shared/contracts/ai-writer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { streamNdjson } from '../common/ndjson.js';
import { AiWriterAbortedError, AiWriterService } from './ai-writer.service.js';
import { AiDraftDto, AiOutlineDto, AiResearchDto } from './dto/ai-writer.dto.js';

const isAbort = (err: unknown) => err instanceof AiWriterAbortedError;

/**
 * Trợ lý "Viết cùng AI" cho bài Tin tức: nghiên cứu (Google) -> dàn ý -> viết từng mục.
 * Chỉ trả dữ liệu cho CMS điền form — KHÔNG ghi DB. Mỗi lần gọi tốn phí LLM nên giới hạn lượt/phút.
 */
@ApiTags('ai-writer (CMS)')
@Controller('ai-writer/news')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class AiWriterController {
  private readonly logger = new Logger(AiWriterController.name);

  constructor(private readonly writer: AiWriterService) {}

  @Post('research/stream')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Nghiên cứu keyword bằng Gemini + Google Search (NDJSON: stage -> result | error)' })
  research(@Body() dto: AiResearchDto, @Res() res: Response) {
    return streamNdjson<AiResearchEvent>(
      res,
      async (send, signal) => {
        const research = await this.writer.research(dto, { onEvent: send, signal });
        send({ type: 'result', research });
      },
      { logger: this.logger, label: `AI nghiên cứu "${dto.keyword}"`, fallbackMessage: 'Không nghiên cứu được lúc này, vui lòng thử lại', isAbort },
    );
  }

  @Post('outline')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Tạo dàn ý + tiêu đề, slug, sapo, chuyên mục, SEO từ kết quả nghiên cứu (KHÔNG lưu)' })
  outline(@Body() dto: AiOutlineDto) {
    return this.writer.outline(dto);
  }

  @Post('draft/stream')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Viết bài theo dàn ý, gửi từng mục khi xong (NDJSON: start -> summary/section/faq -> references -> result)' })
  draft(@Body() dto: AiDraftDto, @Res() res: Response) {
    return streamNdjson<AiDraftEvent>(
      res,
      (send, signal) => this.writer.draft(dto, { onEvent: send, signal }),
      { logger: this.logger, label: `AI viết bài "${dto.title}"`, fallbackMessage: 'Không viết được bài lúc này, vui lòng thử lại', isAbort },
    );
  }
}
