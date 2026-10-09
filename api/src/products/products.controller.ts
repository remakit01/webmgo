import { applyDecorators, Body, Controller, Delete, Get, Headers, HttpException, Param, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import type { ProductAiDraftEvent, ProductAiDraftRequest } from '@remak/shared/contracts/product';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { TranslationAbortedError } from '../translation/translation.service.js';
import { ProductsService } from './products.service.js';
import { ProductsTranslateService } from './products-translate.service.js';
import { ProductInputDto, ReorderProductsDto } from './dto/product-input.dto.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IfMatch = () => applyDecorators(ApiHeader({ name: 'If-Match', required: true, description: 'version (updatedAt ISO) lấy từ GET /products/:id' }));

@ApiTags('products (CMS)')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly translate: ProductsTranslateService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm (mọi trạng thái xuất bản, hoặc thùng rác)' })
  list(@Query('trash') trash?: string) {
    return this.products.list({ trash: trash === 'true' });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm (toàn bộ form)' })
  create(@Body() dto: ProductInputDto) {
    return this.products.create(dto);
  }

  // Khai báo TRƯỚC ':id' để "order" không bị hiểu là id
  @Put('order')
  @ApiOperation({ summary: 'Sắp lại thứ tự (gửi toàn bộ id theo thứ tự mới)' })
  reorder(@Body() dto: ReorderProductsDto) {
    return this.products.reorder(dto.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bản ghi đầy đủ cho form sửa (kèm version cho If-Match)' })
  get(@Param('id') id: string) {
    return this.products.get(id);
  }

  @Put(':id')
  @IfMatch()
  @ApiOperation({ summary: 'Lưu toàn bộ form: gốc + bản dịch + thông số + độ dày + phần mở rộng (1 transaction)' })
  update(@Param('id') id: string, @Body() dto: ProductInputDto, @Headers('if-match') ifMatch?: string) {
    return this.products.update(id, dto, parseIfMatch(ifMatch));
  }

  @Put(':id/cover')
  @IfMatch()
  @ApiOperation({ summary: 'Thay ảnh đại diện' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } }))
  updateCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File | undefined, @Headers('if-match') ifMatch?: string) {
    return this.products.updateCover(id, file, parseIfMatch(ifMatch));
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục sản phẩm từ thùng rác' })
  restore(@Param('id') id: string) {
    return this.products.restore(id);
  }

  @Delete(':id/permanent')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá vĩnh viễn sản phẩm trong thùng rác (chỉ ADMIN)' })
  purge(@Param('id') id: string) {
    return this.products.purge(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ẩn sản phẩm khỏi web (xoá mềm, chuyển vào thùng rác, chỉ ADMIN)' })
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }

  @Post(':id/translations/en/ai-draft/stream')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'AI dịch sản phẩm vi -> en theo luồng NDJSON (không lưu)' })
  async aiDraftStream(
    @Param('id') id: string,
    @Body() body: ProductAiDraftRequest,
    @Res() res: Response,
  ) {
    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) abort.abort();
    });
    let started = false;
    const send = (event: ProductAiDraftEvent) => {
      if (res.writableEnded || abort.signal.aborted) return;
      if (!started) {
        started = true;
        res.status(200);
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
      }
      res.write(`${JSON.stringify(event)}\n`);
    };

    try {
      const draft = await this.translate.aiDraft(id, body, { onEvent: send, signal: abort.signal });
      send({ type: 'result', draft });
    } catch (err) {
      if (err instanceof TranslationAbortedError) return void res.end();
      const status = err instanceof HttpException ? err.getStatus() : 500;
      const respBody = err instanceof HttpException ? err.getResponse() : null;
      const message =
        typeof respBody === 'object' && respBody && 'message' in respBody
          ? String((respBody as { message: unknown }).message)
          : err instanceof Error && status !== 500
            ? err.message
            : 'Dịch thất bại, vui lòng thử lại sau';
      if (started) {
        send({ type: 'error', status, message });
      } else {
        res.status(status).json({ statusCode: status, message });
      }
    } finally {
      if (!res.writableEnded) res.end();
    }
  }
}

