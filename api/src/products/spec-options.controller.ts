import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { SpecOptionsService } from './spec-options.service.js';
import { CreateSpecOptionDto, ReorderSpecOptionsDto, UpdateSpecOptionDto } from './dto/spec-option.dto.js';

@ApiTags('products (CMS)')
@Controller('products/spec-options')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class SpecOptionsController {
  constructor(private readonly options: SpecOptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh mục thông số: mọi nhóm, kèm nhãn vi/en và số sản phẩm đang dùng' })
  list() {
    return this.options.list();
  }

  @Post()
  @ApiOperation({ summary: 'Thêm giá trị (mã bỏ trống = sinh từ nhãn tiếng Việt)' })
  create(@Body() dto: CreateSpecOptionDto) {
    return this.options.create(dto);
  }

  // Khai báo TRƯỚC ':id' để "order" không bị hiểu là id
  @Put('order')
  @ApiOperation({ summary: 'Sắp lại thứ tự giá trị trong 1 nhóm (gửi toàn bộ id của nhóm)' })
  reorder(@Body() dto: ReorderSpecOptionsDto) {
    return this.options.reorder(dto.group, dto.ids);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Sửa nhãn / bật-tắt (If-Match); mã không đổi được' })
  update(@Param('id') id: string, @Body() dto: UpdateSpecOptionDto, @Headers('if-match') ifMatch?: string) {
    return this.options.update(id, dto, parseIfMatch(ifMatch));
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá giá trị không sản phẩm nào dùng (chỉ ADMIN)' })
  remove(@Param('id') id: string) {
    return this.options.remove(id);
  }
}
