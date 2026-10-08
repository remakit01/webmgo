import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { ProductTypesService } from './product-types.service.js';
import { ReorderProductTypesDto, UpsertProductTypeDto } from './dto/product-type.dto.js';

@ApiTags('products (CMS)')
@Controller('products/types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class ProductTypesController {
  constructor(private readonly types: ProductTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách loại sản phẩm (kèm bản dịch, số sản phẩm)' })
  list() {
    return this.types.list();
  }

  @Post()
  @ApiOperation({ summary: 'Thêm loại sản phẩm' })
  create(@Body() dto: UpsertProductTypeDto) {
    return this.types.create(dto);
  }

  // Khai báo TRƯỚC ':id' để "order" không bị hiểu là id
  @Put('order')
  @ApiOperation({ summary: 'Sắp lại thứ tự loại (gửi toàn bộ id theo thứ tự mới)' })
  reorder(@Body() dto: ReorderProductTypesDto) {
    return this.types.reorder(dto.ids);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Sửa loại sản phẩm (If-Match); đổi slug -> URL cũ chuyển hướng' })
  update(@Param('id') id: string, @Body() dto: UpsertProductTypeDto, @Headers('if-match') ifMatch?: string) {
    return this.types.update(id, dto, parseIfMatch(ifMatch));
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá loại không còn sản phẩm (chỉ ADMIN)' })
  remove(@Param('id') id: string) {
    return this.types.remove(id);
  }
}
