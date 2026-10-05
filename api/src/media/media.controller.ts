import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { memoryStorage } from 'multer';
import { MediaService } from '../storage/media.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

/**
 * Ảnh chèn trong nội dung rich text, theo phạm vi (scope). Thêm scope khi loại nội dung mới có editor.
 * prefix phải nằm dưới một PUBLIC_PREFIXES của StorageService. minWidth (tuỳ chọn) chặn ảnh quá nhỏ.
 */
export const MEDIA_SCOPES: Record<string, { prefix: string; minWidth?: number }> = {
  // Tin tức nhận ảnh mọi kích thước (ảnh minh hoạ, sơ đồ, ảnh chụp màn hình nhỏ)
  news: { prefix: 'news/content' },
};
export type MediaScope = string;

class MediaUploadQueryDto {
  @IsIn(Object.keys(MEDIA_SCOPES), { message: 'scope không hợp lệ' })
  scope!: MediaScope;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('images')
  @ApiOperation({ summary: 'Tải ảnh dùng trong nội dung (editor) — trả URL và các biến thể WebP/AVIF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } }),
  )
  async upload(@Query() query: MediaUploadQueryDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "image")');
    const { prefix, minWidth } = MEDIA_SCOPES[query.scope];
    const { imageUrl, images } = await this.media.uploadImage(prefix, file.buffer, { minWidth });
    return { url: imageUrl, images };
  }
}
