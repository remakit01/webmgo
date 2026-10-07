import { Body, Controller, Get, Headers, HttpCode, Ip, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { NewsStatsService } from './news-stats.service.js';
import { PopularQueryDto, PostStatsQueryDto, StatsQueryDto, TrackReadDto, TrackViewDto } from './dto/news-stats.dto.js';

/**
 * Ghi lượt xem / đọc hết bài từ trình duyệt (trang bài là ISR nên server không tự biết có người đọc).
 * Body form-urlencoded: không cần preflight CORS, gửi được bằng navigator.sendBeacon khi rời trang.
 */
@ApiTags('news (public)')
@Controller('news/public')
export class NewsStatsPublicController {
  constructor(private readonly stats: NewsStatsService) {}

  @Post('posts/:id/view')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Ghi một lượt xem (chống trùng 30 phút, bỏ qua bot) — trả tổng lượt xem của bài' })
  view(@Param('id') id: string, @Body() dto: TrackViewDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.stats.trackView(id, dto, { ip, userAgent });
  }

  @Post('posts/:id/read')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Ghi thời gian đọc / đọc hết bài khi rời trang (sendBeacon)' })
  async read(@Param('id') id: string, @Body() dto: TrackReadDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    await this.stats.trackRead(id, dto, { ip, userAgent });
  }

  @Get('popular')
  @ApiOperation({ summary: 'Bài xem nhiều nhất N ngày (cache 5 phút)' })
  popular(@Query() query: PopularQueryDto) {
    return this.stats.popular(query.locale, query.days ?? 7, query.limit ?? 5);
  }
}

@ApiTags('news (CMS)')
@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class NewsStatsCmsController {
  constructor(private readonly stats: NewsStatsService) {}

  @Get('posts/:id/stats')
  @ApiOperation({ summary: 'Thống kê một bài theo ngôn ngữ: lượt xem, đọc hết, thời gian đọc, nguồn truy cập' })
  postStats(@Param('id') id: string, @Query() query: PostStatsQueryDto) {
    return this.stats.postStats(id, query.locale ?? 'vi', query.days ?? 30);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Báo cáo Tin tức cho trang Tổng Quan: tổng, so kỳ trước, theo ngày, theo nguồn, top bài' })
  overview(@Query() query: StatsQueryDto) {
    return this.stats.overview(query.days ?? 30);
  }
}
