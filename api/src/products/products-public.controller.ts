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

  // Các route tĩnh khai báo TRƯỚC ':slug' để "types" / "sitemap" không bị hiểu là slug
  @Get('types')
  @ApiOperation({ summary: 'Loại sản phẩm đang hiện theo ngôn ngữ (nút lọc / trang loại)' })
  types(@Query() query: ProductLocaleQueryDto) {
    return this.products.types(query.locale);
  }

  @Get('types/sitemap')
  @ApiOperation({ summary: 'Slug trang loại theo ngôn ngữ (sitemap.xml)' })
  typesSitemap() {
    return this.products.typesSitemap();
  }

  @Get('types/:slug')
  @ApiOperation({ summary: 'Trang loại { type, products }; slug cũ trả { redirect } để fe 301' })
  async typeBySlug(@Param('slug') slug: string, @Query() query: ProductLocaleQueryDto) {
    const result = await this.products.typeBySlug(slug, query.locale);
    if (!result) throw new NotFoundException('Không tìm thấy loại sản phẩm');
    return result;
  }

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
