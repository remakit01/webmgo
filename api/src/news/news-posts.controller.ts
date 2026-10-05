import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { NewsTranslateService } from './news-translate.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { NewsPostsService } from './news-posts.service.js';
import {
  CreateNewsPostDto,
  NewsLocaleParamDto,
  NewsPostListQueryDto,
  NewsTranslationDto,
  PublishNewsDto,
  SetFeaturedNewsDto,
  SlugCheckQueryDto,
  UpdateNewsPostDto,
} from './dto/news-post.dto.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IfMatch = () =>
  ApiHeader({ name: 'If-Match', required: false, description: 'Phiên bản (version) nhận được lúc GET — chặn ghi đè khi người khác vừa lưu' });

interface AuthUser {
  id: string;
}

@ApiTags('news (CMS)')
@Controller('news/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class NewsPostsController {
  constructor(
    private readonly posts: NewsPostsService,
    private readonly translate: NewsTranslateService,
  ) {}

  // Route tĩnh khai báo trước ":id"

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết (phân trang, lọc trạng thái/ngôn ngữ/chuyên mục, thùng rác)' })
  list(@Query() query: NewsPostListQueryDto) {
    return this.posts.list(query);
  }

  @Get('slug-check')
  @ApiOperation({ summary: 'Kiểm tra slug còn trống và gợi ý slug không trùng' })
  slugCheck(@Query() query: SlugCheckQueryDto) {
    return this.posts.checkSlug(query.locale, query.slug, query.excludeId);
  }

  @Put('featured')
  @ApiOperation({ summary: 'Đặt danh sách bài nổi bật trang chủ theo thứ tự' })
  setFeatured(@Body() dto: SetFeaturedNewsDto) {
    return this.posts.setFeatured(dto.ids);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết (bản tiếng Việt ở trạng thái nháp)' })
  create(@Body() dto: CreateNewsPostDto, @CurrentUser() user: AuthUser) {
    return this.posts.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết bài viết kèm mọi bản dịch và phiên bản' })
  get(@Param('id') id: string) {
    return this.posts.get(id);
  }

  @Patch(':id')
  @IfMatch()
  @ApiOperation({ summary: 'Sửa thông tin chung: chuyên mục, tác giả, tag, nổi bật' })
  update(@Param('id') id: string, @Body() dto: UpdateNewsPostDto, @Headers('if-match') ifMatch: string | undefined, @CurrentUser() user: AuthUser) {
    return this.posts.update(id, dto, parseIfMatch(ifMatch), user.id);
  }

  @Put(':id/cover')
  @IfMatch()
  @ApiOperation({ summary: 'Thay ảnh đại diện (mọi kích thước; khuyến nghị 1200×630 để chia sẻ mạng xã hội đẹp)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } }))
  updateCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Headers('if-match') ifMatch: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.posts.updateCover(id, file, parseIfMatch(ifMatch), user.id);
  }

  @Put(':id/translations/:locale')
  @IfMatch()
  @ApiOperation({ summary: 'Tạo/sửa nội dung một ngôn ngữ (If-Match theo phiên bản của bản dịch đó)' })
  upsertTranslation(@Param() params: NewsLocaleParamDto, @Body() dto: NewsTranslationDto, @Headers('if-match') ifMatch?: string) {
    return this.posts.upsertTranslation(params.id, params.locale, dto, parseIfMatch(ifMatch));
  }

  // Mỗi lần dịch cả bài tốn phí LLM -> giới hạn 5 lần/phút
  @Post(':id/translations/en/ai-draft')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'AI (Gemini) dịch cả bài vi -> en, trả bản nháp để biên tập viên duyệt (KHÔNG lưu)' })
  aiDraft(@Param('id') id: string) {
    return this.translate.aiDraft(id);
  }

  @Post(':id/translations/:locale/publish')
  @IfMatch()
  @ApiOperation({ summary: 'Xuất bản ngay hoặc lên lịch (publishedAt ở tương lai)' })
  publish(@Param() params: NewsLocaleParamDto, @Body() dto: PublishNewsDto, @Headers('if-match') ifMatch?: string) {
    return this.posts.publish(params.id, params.locale, dto, parseIfMatch(ifMatch));
  }

  @Post(':id/translations/:locale/unpublish')
  @IfMatch()
  @ApiOperation({ summary: 'Gỡ về nháp (gỡ bản tiếng Việt thì gỡ luôn các bản dịch)' })
  unpublish(@Param() params: NewsLocaleParamDto, @Headers('if-match') ifMatch?: string) {
    return this.posts.unpublish(params.id, params.locale, parseIfMatch(ifMatch));
  }

  @Post(':id/translations/:locale/archive')
  @IfMatch()
  @ApiOperation({ summary: 'Lưu trữ (ẩn khỏi site, giữ lại để tra cứu)' })
  archive(@Param() params: NewsLocaleParamDto, @Headers('if-match') ifMatch?: string) {
    return this.posts.archive(params.id, params.locale, parseIfMatch(ifMatch));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Chuyển vào thùng rác' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.posts.remove(id, user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục từ thùng rác' })
  restore(@Param('id') id: string) {
    return this.posts.restore(id);
  }

  @Delete(':id/permanent')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá vĩnh viễn bài trong thùng rác (chỉ ADMIN)' })
  purge(@Param('id') id: string) {
    return this.posts.purge(id);
  }
}
