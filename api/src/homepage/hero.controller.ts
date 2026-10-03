import {
  applyDecorators,
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConflictResponse, ApiConsumes, ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { HeroService } from './hero.service.js';
import { HeroPublicQueryDto, HeroTranslationDto, UpdateHeroDto } from './dto/hero.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CONFLICT_MESSAGE, parseIfMatch } from '../common/site-settings.js';

// Khoá lạc quan: CMS gửi phiên bản (versions.* từ GET) qua If-Match; người khác đã lưu trước -> 409
const IfMatchDocs = () =>
  applyDecorators(
    ApiHeader({ name: 'If-Match', required: false, description: 'Phiên bản đang sửa (versions.* từ GET /homepage/hero)' }),
    ApiConflictResponse({ description: CONFLICT_MESSAGE }),
  );

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

@ApiTags('homepage')
@Controller('homepage/hero')
export class HeroController {
  constructor(private readonly hero: HeroService) {}

  @Get('public')
  @ApiOperation({ summary: 'Tiêu đề & điểm nhấn trang chủ theo ngôn ngữ (null nếu chưa cấu hình)' })
  getPublic(@Query() query: HeroPublicQueryDto) {
    return this.hero.getPublic(query.locale ?? 'vi');
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Nội dung hero cho CMS: bản tiếng Việt, bản dịch tiếng Anh (thô) và ảnh' })
  get() {
    return this.hero.getForCms();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'PUT — thay toàn bộ bản tiếng Việt (mọi trường bắt buộc)' })
  @IfMatchDocs()
  update(@Body() dto: UpdateHeroDto, @Headers('if-match') ifMatch?: string) {
    return this.hero.update(dto, parseIfMatch(ifMatch));
  }

  // PATCH vì mọi trường tuỳ chọn: chỉ trường gửi lên mới đổi; "" = xoá bản dịch trường đó (dùng tiếng Việt)
  @Patch('translations/en')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'PATCH — cập nhật một phần bản dịch tiếng Anh' })
  @IfMatchDocs()
  patchEnglish(@Body() dto: HeroTranslationDto, @Headers('if-match') ifMatch?: string) {
    return this.hero.patchTranslation('en', dto, parseIfMatch(ifMatch));
  }

  @Put('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thay ảnh sản phẩm của hero (sinh WebP/AVIF, ảnh cũ bị xoá)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  // memoryStorage: không ghi file xuống đĩa/source
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } }))
  @IfMatchDocs()
  updateImage(@UploadedFile() file?: Express.Multer.File, @Headers('if-match') ifMatch?: string) {
    return this.hero.updateImage(file, parseIfMatch(ifMatch));
  }
}
