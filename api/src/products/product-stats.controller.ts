import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ProductStatsService } from './product-stats.service.js';
import { ProductStatsQueryDto } from './dto/products.dto.js';

@ApiTags('products (CMS)')
@Controller('products/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class ProductStatsController {
  constructor(private readonly stats: ProductStatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Báo cáo Sản phẩm cho trang Tổng Quan: tổng, so kỳ trước, theo ngày, theo nguồn, top sản phẩm' })
  overview(@Query() query: ProductStatsQueryDto) {
    return this.stats.overview(query.days ?? 30);
  }
}
