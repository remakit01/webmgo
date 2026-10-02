import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { BannersService } from './banners.service.js';
import {
  CreateBannerDto,
  ReorderBannersDto,
  SwiperSettingsDto,
  TrashSettingsDto,
  UpdateBannerDto,
} from './dto/banner.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
// memoryStorage: không ghi file xuống đĩa/source, buffer đi thẳng sang sharp -> MinIO
const imageUpload = () =>
  FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } });

const imageBody = { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } };

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  // ── Public (FE gọi lúc build/ISR) ───────────────────────────────────────

  @Get('public')
  @ApiOperation({ summary: 'Banner đang bật + cấu hình swiper cho trang chủ' })
  findPublic() {
    return this.banners.findPublic();
  }

  // ── CMS ───────────────────────────────────────────────────────────────────
  // Route tĩnh (settings/swiper, reorder) khai báo trước ":id"

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  findAll() {
    return this.banners.findAll();
  }

  @Get('settings/swiper')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  getSwiper() {
    return this.banners.getSwiperSettings();
  }

  @Put('settings/swiper')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  updateSwiper(@Body() dto: SwiperSettingsDto) {
    return this.banners.updateSwiperSettings(dto);
  }

  @Get('trash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Banner trong thùng rác (kèm ngày sẽ bị xoá vĩnh viễn)' })
  findTrash() {
    return this.banners.findTrash();
  }

  @Get('trash/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cài đặt thùng rác (tự dọn, số ngày lưu) và lần dọn gần nhất' })
  getTrashSettings() {
    return this.banners.getTrashOverview();
  }

  @Put('trash/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Bật/tắt tự dọn và đổi số ngày lưu thùng rác' })
  updateTrashSettings(@Body() dto: TrashSettingsDto) {
    return this.banners.updateTrashSettings(dto);
  }

  @Post('trash/purge-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Dọn ngay: xoá vĩnh viễn các banner đã quá hạn lưu' })
  purgeExpired(@CurrentUser() user: { username?: string | null; email: string }) {
    return this.banners.purgeExpired(user.username || user.email);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  reorder(@Body() dto: ReorderBannersDto) {
    return this.banners.reorder(dto.ids);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageBody)
  @UseInterceptors(imageUpload())
  create(@Body() dto: CreateBannerDto, @UploadedFile() file?: Express.Multer.File) {
    return this.banners.create(dto, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageBody)
  @UseInterceptors(imageUpload())
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto, @UploadedFile() file?: Express.Multer.File) {
    return this.banners.update(id, dto, file);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  toggle(@Param('id') id: string) {
    return this.banners.toggle(id);
  }

  // Xoá mềm khôi phục được => EDITOR được phép; xoá vĩnh viễn chỉ ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Chuyển banner vào thùng rác' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.banners.remove(id, user.id);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Khôi phục banner từ thùng rác (về trạng thái ẩn)' })
  restore(@Param('id') id: string) {
    return this.banners.restore(id);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá vĩnh viễn banner trong thùng rác (DB + MinIO)' })
  purge(@Param('id') id: string) {
    return this.banners.purge(id);
  }
}
