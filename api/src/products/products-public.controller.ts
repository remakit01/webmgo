import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsPublicService } from './products-public.service.js';
import { ProductLocaleQueryDto } from './dto/products.dto.js';

@ApiTags('products (public)')
@Controller('products/public')
export class ProductsPublicController {
  constructor(private readonly products: ProductsPublicService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách dòng tấm MgO đã xuất bản theo ngôn ngữ' })
  list(@Query() query: ProductLocaleQueryDto) {
    return this.products.list(query.locale);
  }

  // Khai báo TRƯỚC ':slug' để "sitemap" không bị hiểu là slug
  @Get('sitemap')
  @ApiOperation({ summary: 'Slug theo ngôn ngữ + ngày cập nhật (sitemap.xml / hreflang)' })
  sitemap() {
    return this.products.sitemap();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết sản phẩm { product }; slug cũ trả { redirect } để fe 301' })
  async bySlug(@Param('slug') slug: string, @Query() query: ProductLocaleQueryDto) {
    const result = await this.products.bySlug(slug, query.locale);
    if (!result) throw new NotFoundException('Không tìm thấy sản phẩm');
    return result;
  }
}
