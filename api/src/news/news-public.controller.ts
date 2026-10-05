import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsPublicService } from './news-public.service.js';
import { NewsLocaleQueryDto, NewsPublicListQueryDto } from './dto/news-public.dto.js';

/** Endpoint cho site public (fe gọi lúc build/ISR) — chỉ trả bài đã xuất bản và tới giờ đăng */
@ApiTags('news (public)')
@Controller('news/public')
export class NewsPublicController {
  constructor(private readonly news: NewsPublicService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Danh sách bài theo ngôn ngữ (lọc chuyên mục/tag/nổi bật, phân trang)' })
  list(@Query() query: NewsPublicListQueryDto) {
    return this.news.list(query);
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Bài theo slug của ngôn ngữ; slug cũ trả { redirect } để fe 301' })
  async bySlug(@Param('slug') slug: string, @Query() query: NewsLocaleQueryDto) {
    const result = await this.news.bySlug(query.locale, slug);
    if (!result) throw new NotFoundException('Không tìm thấy bài viết');
    return result;
  }

  @Get('categories')
  @ApiOperation({ summary: 'Chuyên mục đang bật theo ngôn ngữ' })
  categories(@Query() query: NewsLocaleQueryDto) {
    return this.news.categories(query.locale);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Mọi bài đang hiển thị kèm slug từng ngôn ngữ (sitemap + hreflang)' })
  sitemap() {
    return this.news.sitemap();
  }
}
