import { Module } from '@nestjs/common';
import { NewsStatsCmsController, NewsStatsPublicController } from './news-stats.controller.js';
import { NewsStatsService } from './news-stats.service.js';

// Lượt xem / đọc hết / nguồn truy cập bài Tin tức (Prisma, Redis đến từ module global)
@Module({
  controllers: [NewsStatsPublicController, NewsStatsCmsController],
  providers: [NewsStatsService],
  exports: [NewsStatsService],
})
export class NewsStatsModule {}
