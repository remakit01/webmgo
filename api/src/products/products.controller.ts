import { applyDecorators, Body, Controller, Delete, Get, Headers, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { ProductsService } from './products.service.js';
import { ProductInputDto, ReorderProductsDto } from './dto/product-input.dto.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IfMatch = () => applyDecorators(ApiHeader({ name: 'If-Match', required: true, description: 'version (updatedAt ISO) lấy từ GET /products/:id' }));

@ApiTags('products (CMS)')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm (mọi trạng thái xuất bản)' })
  list() {
    return this.products.list();
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

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ẩn sản phẩm khỏi web (xoá mềm, chỉ ADMIN)' })
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
