import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { MediaService } from '../storage/media.service.js';
import { CONFLICT_MESSAGE, readSetting, saveSettingVersioned } from '../common/site-settings.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';
import type { CreateBannerDto, SwiperSettingsDto, TrashSettingsDto, UpdateBannerDto } from './dto/banner.dto.js';

const CACHE_KEY = 'banners:public';
const CACHE_TTL = 60;
const SWIPER_KEY = 'homepage.banner.swiper';
const REVALIDATE_TAG = 'banners';
// Banner hiển thị full-width (khung 1024/342 ≈ 3:1): dưới 1024px sẽ vỡ nét trên desktop. Khuyến nghị 1920×640.
const BANNER_MIN_WIDTH = 1024;
// Thùng rác: banner đã xoá giữ retentionDays ngày rồi mới đủ hạn xoá hẳn (DB + MinIO).
// Cấu hình (ADMIN chỉnh trong CMS) lưu ở site_settings; đây chỉ là giá trị mặc định khi chưa cấu hình.
const TRASH_SETTINGS_KEY = 'banners.trash';
const TRASH_LAST_RUN_KEY = 'banners.trash.lastRun';
const DEFAULT_TRASH_SETTINGS: TrashSettingsDto = { autoPurgeEnabled: true, retentionDays: 30 };
const DAY_MS = 24 * 60 * 60 * 1000;
const PURGE_LOCK_KEY = 'lock:banners:purge';
const NOT_DELETED = { deletedAt: null };
const DEFAULT_SWIPER: SwiperSettingsDto = { autoPlayInterval: 3500, pauseOnHover: true, showDots: false };

export interface PurgeRun {
  at: string;
  by: string; // 'cron' hoặc username/email của ADMIN bấm "Dọn ngay"
  purged: number;
}

// '' (người dùng xoá trường) -> null; undefined (không gửi) -> giữ nguyên
const blankToNull = (v: string | undefined) => (v === undefined ? undefined : v.trim() === '' ? null : v.trim());

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly media: MediaService,
    private readonly revalidate: RevalidateService,
  ) {}

  // ── Public ────────────────────────────────────────────────────────────────

  async findPublic() {
    const cached = await this.redis.getJson<unknown>(CACHE_KEY);
    if (cached) return cached;

    const [banners, swiper] = await Promise.all([
      this.prisma.banner.findMany({
        where: { isActive: true, ...NOT_DELETED },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          title: true,
          subtitle: true,
          alt: true,
          ctaText: true,
          linkUrl: true,
          imageUrl: true,
          images: true,
        },
      }),
      this.getSwiperSettings(),
    ]);
    const payload = { banners, swiper };
    await this.redis.setJson(CACHE_KEY, payload, CACHE_TTL);
    return payload;
  }

  // ── CMS ───────────────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.banner.findMany({ where: NOT_DELETED, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  }

  async create(dto: CreateBannerDto, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "image")');
    const upload = await this.uploadImage(file.buffer);

    try {
      const banner = await this.prisma.banner.create({
        data: {
          title: dto.title,
          alt: dto.alt,
          subtitle: blankToNull(dto.subtitle),
          ctaText: blankToNull(dto.ctaText),
          linkUrl: blankToNull(dto.linkUrl),
          isActive: dto.isActive ?? true,
          sortOrder: await this.nextSortOrder(),
          ...upload,
        },
      });
      await this.afterChange();
      return banner;
    } catch (err) {
      await this.removeImage(upload.imageKey);
      throw err;
    }
  }

  async update(id: string, dto: UpdateBannerDto, file?: Express.Multer.File) {
    const existing = await this.getOrThrow(id);
    const upload = file ? await this.uploadImage(file.buffer) : undefined;

    try {
      // Ghi có điều kiện updated_at = lúc đọc: nếu request khác (vd người khác cũng thay ảnh) đã ghi chen vào
      // -> 0 dòng -> 409 và dọn ảnh vừa upload; nhờ vậy chỉ xoá ĐÚNG ảnh bị thay, không sót file rác MinIO.
      const { count } = await this.prisma.banner.updateMany({
        where: { id, updatedAt: existing.updatedAt, ...NOT_DELETED },
        data: {
          title: dto.title,
          alt: dto.alt,
          subtitle: blankToNull(dto.subtitle),
          ctaText: blankToNull(dto.ctaText),
          linkUrl: blankToNull(dto.linkUrl),
          isActive: dto.isActive,
          ...upload,
        },
      });
      if (count === 0) throw new ConflictException(CONFLICT_MESSAGE);
      const banner = await this.getOrThrow(id);
      if (upload) await this.removeImage(existing.imageKey);
      await this.afterChange();
      return banner;
    } catch (err) {
      if (upload) await this.removeImage(upload.imageKey);
      throw err;
    }
  }

  async toggle(id: string) {
    const existing = await this.getOrThrow(id);
    const banner = await this.prisma.banner.update({ where: { id }, data: { isActive: !existing.isActive } });
    await this.afterChange();
    return banner;
  }

  /** Chuyển vào thùng rác: ẩn khỏi trang chủ và danh sách ngay, ảnh trong MinIO giữ nguyên để khôi phục. */
  async remove(id: string, userId: string) {
    await this.getOrThrow(id);
    await this.prisma.banner.update({ where: { id }, data: { deletedAt: new Date(), deletedById: userId } });
    await this.afterChange();
    const { retentionDays } = await this.getTrashSettings();
    return { success: true, retentionDays };
  }

  // ── Thùng rác ─────────────────────────────────────────────────────────────

  async findTrash() {
    const banners = await this.prisma.banner.findMany({
      where: { deletedAt: { not: null } },
      orderBy: [{ deletedAt: 'desc' }, { id: 'desc' }],
      include: { deletedBy: { select: { id: true, username: true, email: true } } },
    });
    const { retentionDays } = await this.getTrashSettings();
    // purgeAt = thời điểm đủ hạn xoá vĩnh viễn (job tự dọn hoặc ADMIN bấm "Dọn ngay")
    return banners.map((b) => ({ ...b, purgeAt: new Date(b.deletedAt!.getTime() + retentionDays * DAY_MS) }));
  }

  /** Khôi phục về cuối danh sách ở trạng thái ẩn, để người dùng kiểm tra lại trước khi bật. */
  async restore(id: string) {
    await this.getDeletedOrThrow(id);
    const banner = await this.prisma.banner.update({
      where: { id },
      data: { deletedAt: null, deletedById: null, isActive: false, sortOrder: await this.nextSortOrder() },
    });
    await this.afterChange();
    return banner;
  }

  /** Xoá vĩnh viễn một banner đã ở trong thùng rác (DB + toàn bộ object MinIO). */
  async purge(id: string) {
    const existing = await this.getDeletedOrThrow(id);
    await this.prisma.banner.delete({ where: { id } });
    await this.removeImage(existing.imageKey);
    return { success: true };
  }

  async reorder(ids: string[]) {
    const count = await this.prisma.banner.count({ where: { id: { in: ids }, ...NOT_DELETED } });
    if (new Set(ids).size !== ids.length || count !== ids.length) {
      throw new BadRequestException('Danh sách id không hợp lệ hoặc trùng lặp');
    }
    await this.prisma.$transaction(
      ids.map((id, index) => this.prisma.banner.update({ where: { id }, data: { sortOrder: index } })),
    );
    await this.afterChange();
    return this.findAll();
  }

  /** Job hằng đêm: chỉ chạy khi ADMIN bật tự dọn. Giờ cố định theo giờ Việt Nam, không phụ thuộc múi giờ server. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'banners-purge-trash', timeZone: 'Asia/Ho_Chi_Minh' })
  async scheduledPurge() {
    const { autoPurgeEnabled } = await this.getTrashSettings();
    if (!autoPurgeEnabled) return;
    try {
      await this.purgeExpired('cron');
    } catch (err) {
      if (!(err instanceof ConflictException)) this.logger.error(`Tự dọn thùng rác lỗi: ${(err as Error).message}`);
    }
  }

  /**
   * Xoá vĩnh viễn banner đã quá hạn lưu. Dùng chung cho job và nút "Dọn ngay" (chạy được cả khi tự dọn đang tắt).
   * Lock Redis để nhiều instance API / nhiều lần bấm không chạy chồng nhau.
   */
  async purgeExpired(by: string): Promise<PurgeRun> {
    if (!(await this.redis.acquireLock(PURGE_LOCK_KEY, 10 * 60))) {
      throw new ConflictException('Đang có một lượt dọn thùng rác khác chạy, vui lòng thử lại sau');
    }
    try {
      const { retentionDays } = await this.getTrashSettings();
      const cutoff = new Date(Date.now() - retentionDays * DAY_MS);
      const expired = await this.prisma.banner.findMany({
        where: { deletedAt: { lt: cutoff } },
        select: { id: true, imageKey: true },
      });
      for (const b of expired) {
        await this.prisma.banner.delete({ where: { id: b.id } });
        await this.removeImage(b.imageKey);
      }
      const run: PurgeRun = { at: new Date().toISOString(), by, purged: expired.length };
      await this.saveSetting(TRASH_LAST_RUN_KEY, run);
      this.logger.log(`Dọn thùng rác (${by}): xoá vĩnh viễn ${expired.length} banner quá ${retentionDays} ngày`);
      return run;
    } finally {
      await this.redis.del(PURGE_LOCK_KEY);
    }
  }

  async getTrashSettings(): Promise<TrashSettingsDto> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: TRASH_SETTINGS_KEY } });
    return { ...DEFAULT_TRASH_SETTINGS, ...((row?.value as Partial<TrashSettingsDto> | undefined) ?? {}) };
  }

  /** Cài đặt + lần dọn gần nhất + phiên bản (gửi lại qua If-Match khi lưu), cho CMS hiển thị. */
  async getTrashOverview() {
    const [row, lastRunRow] = await Promise.all([
      readSetting<Partial<TrashSettingsDto>>(this.prisma, TRASH_SETTINGS_KEY),
      this.prisma.siteSetting.findUnique({ where: { key: TRASH_LAST_RUN_KEY } }),
    ]);
    return {
      ...DEFAULT_TRASH_SETTINGS,
      ...(row?.value ?? {}),
      lastRun: (lastRunRow?.value as PurgeRun | undefined) ?? null,
      version: row?.version ?? null,
    };
  }

  /** PUT có khoá lạc quan: 2 ADMIN đổi cài đặt cùng lúc -> người sau nhận 409 thay vì ghi đè im lặng. */
  async updateTrashSettings(dto: TrashSettingsDto, ifMatch?: string) {
    const value = { autoPurgeEnabled: dto.autoPurgeEnabled, retentionDays: dto.retentionDays };
    await saveSettingVersioned(this.prisma, TRASH_SETTINGS_KEY, () => value, ifMatch);
    return this.getTrashOverview();
  }

  // ── Swiper settings ───────────────────────────────────────────────────────

  async getSwiperSettings(): Promise<SwiperSettingsDto> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: SWIPER_KEY } });
    return { ...DEFAULT_SWIPER, ...((row?.value as Partial<SwiperSettingsDto> | undefined) ?? {}) };
  }

  /** Cho CMS: cài đặt + phiên bản (gửi lại qua If-Match khi lưu). */
  async getSwiperSettingsForCms() {
    const row = await readSetting<Partial<SwiperSettingsDto>>(this.prisma, SWIPER_KEY);
    return { ...DEFAULT_SWIPER, ...(row?.value ?? {}), version: row?.version ?? null };
  }

  /** PUT có khoá lạc quan (If-Match) — xem common/site-settings.ts */
  async updateSwiperSettings(dto: SwiperSettingsDto, ifMatch?: string) {
    const value = { autoPlayInterval: dto.autoPlayInterval, pauseOnHover: dto.pauseOnHover, showDots: dto.showDots };
    await saveSettingVersioned(this.prisma, SWIPER_KEY, () => value, ifMatch);
    await this.afterChange();
    return this.getSwiperSettingsForCms();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Banner đang dùng (chưa vào thùng rác) — banner đã xoá coi như không tồn tại với sửa/bật tắt. */
  private async getOrThrow(id: string) {
    const banner = await this.prisma.banner.findFirst({ where: { id, ...NOT_DELETED } });
    if (!banner) throw new NotFoundException('Không tìm thấy banner');
    return banner;
  }

  private async getDeletedOrThrow(id: string) {
    const banner = await this.prisma.banner.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!banner) throw new NotFoundException('Không tìm thấy banner trong thùng rác');
    return banner;
  }

  private async saveSetting(key: string, value: object) {
    await this.prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  private async nextSortOrder() {
    const last = await this.prisma.banner.aggregate({ where: NOT_DELETED, _max: { sortOrder: true } });
    return (last._max.sortOrder ?? -1) + 1;
  }

  private async uploadImage(input: Buffer) {
    const { imageKey, imageUrl, images } = await this.media.uploadImage('banners', input, {
      minWidth: BANNER_MIN_WIDTH,
    });
    return { imageKey, imageUrl, images: images as unknown as object };
  }

  private removeImage(imageKey: string) {
    return this.media.removeImage(imageKey);
  }

  private async afterChange() {
    await this.redis.delCache(CACHE_KEY);
    await this.revalidate.trigger(REVALIDATE_TAG);
  }
}
