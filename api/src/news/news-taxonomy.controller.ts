import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { NewsTaxonomyService } from './news-taxonomy.service.js';
import { ReorderNewsCategoriesDto, UpsertNewsAuthorDto, UpsertNewsCategoryDto, UpsertNewsTagDto } from './dto/news-taxonomy.dto.js';

@ApiTags('news (CMS)')
@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class NewsTaxonomyController {
  constructor(private readonly taxonomy: NewsTaxonomyService) {}

  // ── Chuyên mục ──

  @Get('categories')
  @ApiOperation({ summary: 'Danh sách chuyên mục (kèm bản dịch, số bài)' })
  listCategories() {
    return this.taxonomy.listCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Tạo chuyên mục' })
  createCategory(@Body() dto: UpsertNewsCategoryDto) {
    return this.taxonomy.createCategory(dto);
  }

  // Khai báo TRƯỚC 'categories/:id' để "order" không bị hiểu là id
  @Put('categories/order')
  @ApiOperation({ summary: 'Sắp lại thứ tự chuyên mục (gửi toàn bộ id theo thứ tự mới)' })
  reorderCategories(@Body() dto: ReorderNewsCategoriesDto) {
    return this.taxonomy.reorderCategories(dto.ids);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Sửa chuyên mục (If-Match)' })
  updateCategory(@Param('id') id: string, @Body() dto: UpsertNewsCategoryDto, @Headers('if-match') ifMatch?: string) {
    return this.taxonomy.updateCategory(id, dto, parseIfMatch(ifMatch));
  }

  @Delete('categories/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá chuyên mục trống (chỉ ADMIN)' })
  removeCategory(@Param('id') id: string) {
    return this.taxonomy.removeCategory(id);
  }

  // ── Tag ──

  @Get('tags')
  @ApiOperation({ summary: 'Tìm tag (tối đa 200)' })
  listTags(@Query('q') q?: string) {
    return this.taxonomy.listTags(q?.slice(0, 100));
  }

  @Post('tags')
  @ApiOperation({ summary: 'Tạo tag' })
  createTag(@Body() dto: UpsertNewsTagDto) {
    return this.taxonomy.createTag(dto);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Sửa tag (If-Match)' })
  updateTag(@Param('id') id: string, @Body() dto: UpsertNewsTagDto, @Headers('if-match') ifMatch?: string) {
    return this.taxonomy.updateTag(id, dto, parseIfMatch(ifMatch));
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Xoá tag (gỡ khỏi các bài)' })
  removeTag(@Param('id') id: string) {
    return this.taxonomy.removeTag(id);
  }

  // ── Tác giả ──

  @Get('authors')
  @ApiOperation({ summary: 'Danh sách tác giả' })
  listAuthors() {
    return this.taxonomy.listAuthors();
  }

  @Post('authors')
  @ApiOperation({ summary: 'Tạo tác giả' })
  createAuthor(@Body() dto: UpsertNewsAuthorDto) {
    return this.taxonomy.createAuthor(dto);
  }

  @Put('authors/:id')
  @ApiOperation({ summary: 'Sửa tác giả (If-Match)' })
  updateAuthor(@Param('id') id: string, @Body() dto: UpsertNewsAuthorDto, @Headers('if-match') ifMatch?: string) {
    return this.taxonomy.updateAuthor(id, dto, parseIfMatch(ifMatch));
  }

  @Delete('authors/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá tác giả (bài chuyển về không ghi tác giả, chỉ ADMIN)' })
  removeAuthor(@Param('id') id: string) {
    return this.taxonomy.removeAuthor(id);
  }
}
