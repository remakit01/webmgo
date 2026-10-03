import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { TranslationService } from './translation.service.js';
import { TranslateDto } from './dto/translate.dto.js';

@ApiTags('translation')
@Controller('translate')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class TranslationController {
  constructor(private readonly translation: TranslationService) {}

  // Mỗi lần gọi tốn phí LLM -> giới hạn 10 lần/phút (theo IP)
  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Dịch tự động các ô nội dung VI -> EN bằng Gemini (không lưu, CMS tự điền vào form)' })
  async translate(@Body() dto: TranslateDto) {
    return { fields: await this.translation.translate(dto.fields, dto.context) };
  }
}
