import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { parseIfMatch } from '../common/site-settings.js';
import { AiIndexService } from './ai-index.service.js';
import { AiRetrieverService } from './ai-retriever.service.js';
import { AiKnowledgeService } from './ai-knowledge.service.js';
import { AcceptSuggestionsDto, AiKnowledgeDto, AiKnowledgeListQueryDto, AiKnowledgeSearchQueryDto } from './dto/ai-knowledge.dto.js';

interface AuthUser {
  id: string;
}

const IfMatch = () =>
  ApiHeader({ name: 'If-Match', required: false, description: 'Phiên bản (version) nhận được lúc GET — chặn ghi đè khi người khác vừa lưu' });

@ApiTags('ai-knowledge (CMS)')
@Controller('ai-knowledge')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiCookieAuth('access_token')
export class AiKnowledgeController {
  constructor(
    private readonly knowledge: AiKnowledgeService,
    private readonly index: AiIndexService,
    private readonly retriever: AiRetrieverService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách kiến thức AI (tìm, lọc theo loại / trạng thái / nguồn gốc)' })
  list(@Query() query: AiKnowledgeListQueryDto) {
    return this.knowledge.list(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê kho: tổng, đang dùng, đã lập chỉ mục, model embedding' })
  stats() {
    return this.knowledge.stats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Thử tra cứu: kiến thức + bài cũ mà AI viết bài sẽ tìm thấy cho một keyword' })
  search(@Query() query: AiKnowledgeSearchQueryDto) {
    return this.retriever.retrieve({ keyword: query.q });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một mẩu kiến thức' })
  get(@Param('id') id: string) {
    return this.knowledge.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm mẩu kiến thức (lập chỉ mục embedding nền)' })
  create(@Body() dto: AiKnowledgeDto, @CurrentUser() user?: AuthUser) {
    return this.knowledge.create(dto, user?.id);
  }

  @Put(':id')
  @IfMatch()
  @ApiOperation({ summary: 'Sửa mẩu kiến thức (khôi phục: gửi status ACTIVE)' })
  update(@Param('id') id: string, @Body() dto: AiKnowledgeDto, @Headers('if-match') ifMatch?: string, @CurrentUser() user?: AuthUser) {
    return this.knowledge.update(id, dto, parseIfMatch(ifMatch), user?.id);
  }

  @Delete(':id')
  @IfMatch()
  @ApiOperation({ summary: 'Lưu trữ mẩu kiến thức (AI không dùng nữa)' })
  archive(@Param('id') id: string, @Headers('if-match') ifMatch?: string, @CurrentUser() user?: AuthUser) {
    return this.knowledge.archive(id, parseIfMatch(ifMatch), user?.id);
  }

  @Post('accept-suggestions')
  @HttpCode(200)
  @ApiOperation({ summary: 'Lưu kiến thức mới AI tìm trên web mà biên tập viên đã duyệt (bỏ qua mẩu trùng)' })
  acceptSuggestions(@Body() dto: AcceptSuggestionsDto, @CurrentUser() user?: AuthUser) {
    return this.knowledge.acceptSuggestions(dto.items, user?.id);
  }

  @Post('reindex')
  @HttpCode(200)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lập chỉ mục embedding lại toàn bộ kho + bài Tin tức (chỉ nhúng đoạn đã đổi)' })
  reindex() {
    return this.index.syncAll();
  }
}
