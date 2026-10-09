import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Locale } from '@remak/shared/locale';
import {
  SPEC_OPTION_GROUPS,
  isValidSpecOptionCode,
  specOptionCodeFrom,
  type SpecOptionCms,
  type SpecOptionGroup,
  type SpecOptionLabels,
} from '@remak/shared/contracts/product';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentCacheService } from '../content-cache/content-cache.service.js';
import { assertUpdated, assertVersion, versionOf } from '../common/versioning.js';
import type { CreateSpecOptionDto, UpdateSpecOptionDto } from './dto/spec-option.dto.js';
import { PRODUCTS_INVALIDATE } from './products.constants.js';

const ORDER = [{ group: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }] as const;
const usageKey = (group: string, code: string) => `${group}:${code}`;

/**
 * Danh mục thông số (kiểu cạnh, màu lõi, pha tinh thể…): giá trị theo nhóm, nhãn vi/en.
 * Cột thông số của sản phẩm lưu `code` -> mã không đổi sau khi tạo; đang được dùng thì không xoá (tắt thay thế).
 * Mọi thay đổi xoá cache Sản phẩm + revalidate tag "products" (trang chi tiết hiện nhãn).
 */
@Injectable()
export class SpecOptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ContentCacheService,
  ) {}

  async list(): Promise<SpecOptionCms[]> {
    const [rows, usage] = await Promise.all([
      this.prisma.specOption.findMany({ orderBy: [...ORDER], include: { translations: true } }),
      this.usageCounts(),
    ]);
    return rows.map((r) => ({
      id: r.id,
      group: r.group,
      code: r.code,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
      usageCount: usage.get(usageKey(r.group, r.code)) ?? 0,
      version: versionOf(r),
      labels: Object.fromEntries(r.translations.map((t) => [t.locale, t.label])),
    }));
  }

  async create(dto: CreateSpecOptionDto): Promise<SpecOptionCms> {
    const code = dto.code?.trim() || specOptionCodeFrom(dto.labels.vi);
    if (!isValidSpecOptionCode(code)) throw new BadRequestException('Không tạo được mã từ nhãn — hãy tự nhập mã (vd PHASE_517)');
    if ((await this.prisma.specOption.count({ where: { group: dto.group, code } })) > 0) {
      throw new ConflictException(`Mã "${code}" đã có trong nhóm này — chọn mã khác`);
    }
    const last = await this.prisma.specOption.aggregate({ where: { group: dto.group }, _max: { sortOrder: true } });
    const created = await this.prisma.specOption.create({
      data: {
        group: dto.group,
        code,
        isActive: dto.isActive,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
        translations: { create: this.labelRows(dto) },
      },
    });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.find(created.id);
  }

  async update(id: string, dto: UpdateSpecOptionDto, ifMatch?: string): Promise<SpecOptionCms> {
    const existing = await this.prisma.specOption.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy giá trị');
    if (dto.code && dto.code !== existing.code) {
      throw new BadRequestException('Không đổi được mã — sản phẩm đang lưu theo mã này. Hãy sửa nhãn, hoặc tạo giá trị mới');
    }
    assertVersion(ifMatch, existing.updatedAt);
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.specOption.updateMany({ where: { id, updatedAt: existing.updatedAt }, data: { isActive: dto.isActive } });
      assertUpdated(count);
      await tx.specOptionTranslation.deleteMany({ where: { optionId: id } });
      await tx.specOptionTranslation.createMany({ data: this.labelRows(dto).map((l) => ({ optionId: id, ...l })) });
    });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.find(id);
  }

  /** Sắp lại thứ tự trong 1 nhóm: SQL thô một lệnh, KHÔNG đổi updated_at */
  async reorder(group: SpecOptionGroup, ids: string[]): Promise<SpecOptionCms[]> {
    const existing = await this.prisma.specOption.findMany({ where: { group }, select: { id: true } });
    const known = new Set(existing.map((r) => r.id));
    if (ids.length !== known.size || ids.some((x) => !known.has(x))) {
      throw new ConflictException('Danh sách giá trị vừa thay đổi — tải lại trang rồi sắp lại');
    }
    await this.prisma.$executeRaw`
      UPDATE spec_options AS s SET sort_order = o.ord - 1
      FROM unnest(${ids}::text[]) WITH ORDINALITY AS o(id, ord)
      WHERE s.id = o.id`;
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.list();
  }

  async remove(id: string): Promise<{ success: true }> {
    const option = await this.prisma.specOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('Không tìm thấy giá trị');
    const used = (await this.usageCounts()).get(usageKey(option.group, option.code)) ?? 0;
    if (used > 0) throw new ConflictException(`Giá trị đang dùng ở ${used} sản phẩm — tắt thay vì xoá`);
    await this.prisma.specOption.delete({ where: { id } });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return { success: true };
  }

  /** Mã hợp lệ theo nhóm (gồm cả mã đang tắt — sản phẩm cũ vẫn lưu được) */
  async codesByGroup(): Promise<Map<SpecOptionGroup, Set<string>>> {
    const rows = await this.prisma.specOption.findMany({ orderBy: [...ORDER], include: { translations: true } });
    const map = new Map<SpecOptionGroup, Set<string>>(SPEC_OPTION_GROUPS.map((g) => [g, new Set<string>()]));
    for (const r of rows) map.get(r.group)?.add(r.code);
    return map;
  }

  /** Nhãn theo ngôn ngữ (thiếu bản dịch -> tiếng Việt) cho đúng các mã được dùng */
  async labelsFor(locale: Locale, used: { group: SpecOptionGroup; code: string }[]): Promise<SpecOptionLabels> {
    if (!used.length) return {};
    const rows = await this.prisma.specOption.findMany({ orderBy: [...ORDER], include: { translations: true } });
    const wanted = new Set(used.map((u) => usageKey(u.group, u.code)));
    const labels: SpecOptionLabels = {};
    for (const r of rows) {
      if (!wanted.has(usageKey(r.group, r.code))) continue;
      const label = r.translations.find((t) => t.locale === locale)?.label ?? r.translations.find((t) => t.locale === 'vi')?.label;
      if (label) (labels[r.group] ??= {})[r.code] = label;
    }
    return labels;
  }

  private async find(id: string): Promise<SpecOptionCms> {
    const found = (await this.list()).find((o) => o.id === id);
    if (!found) throw new NotFoundException('Không tìm thấy giá trị');
    return found;
  }

  private labelRows(dto: UpdateSpecOptionDto): { locale: Locale; label: string }[] {
    return [{ locale: 'vi' as const, label: dto.labels.vi }, ...(dto.labels.en ? [{ locale: 'en' as const, label: dto.labels.en }] : [])];
  }

  /**
   * Số sản phẩm dùng từng (nhóm, mã) — quét mọi cột thông số, kể cả sản phẩm trong thùng rác
   * (xoá giá trị đang nằm trong dữ liệu sẽ làm mất nhãn khi khôi phục sản phẩm).
   */
  private async usageCounts(): Promise<Map<string, number>> {
    const rows = await this.prisma.$queryRaw<{ grp: string; code: string; n: number }[]>`
      SELECT grp, code, COUNT(DISTINCT pid)::int AS n FROM (
        SELECT 'EDGE_PROFILE' AS grp, edge_profile AS code, product_id AS pid FROM product_technical_specs WHERE edge_profile IS NOT NULL
        UNION ALL SELECT 'EDGE_PROFILE', unnest(edge_profiles), product_id FROM floor_board_specs
        UNION ALL SELECT 'CORE_COLOR', core_color, product_id FROM product_technical_specs WHERE core_color IS NOT NULL
        UNION ALL SELECT 'SURFACE_FINISH', surface_finish, product_id FROM product_technical_specs WHERE surface_finish IS NOT NULL
        UNION ALL SELECT 'SCREW_HOLDING', screw_holding_rating, product_id FROM product_technical_specs WHERE screw_holding_rating IS NOT NULL
        UNION ALL SELECT 'CRYSTAL_PHASE', crystal_phase, product_id FROM product_technical_specs WHERE crystal_phase IS NOT NULL
        UNION ALL SELECT 'VOC_LEVEL', voc_level, product_id FROM product_technical_specs WHERE voc_level IS NOT NULL
        UNION ALL SELECT 'SUITABLE_FLOORING', unnest(suitable_floorings), product_id FROM floor_board_specs
        UNION ALL SELECT 'SIP_CORE_MATERIAL', unnest(core_materials), product_id FROM sip_panel_specs
        UNION ALL SELECT 'LOAD_BEARING', load_bearing, product_id FROM sip_panel_specs WHERE load_bearing IS NOT NULL
        UNION ALL SELECT 'DECORATIVE_FINISH', finish_type, product_id FROM decorative_finish_options
        UNION ALL SELECT 'SCRATCH_RESISTANCE', scratch_resistance, product_id FROM decorative_finish_options WHERE scratch_resistance IS NOT NULL
      ) u
      GROUP BY grp, code`;
    return new Map(rows.map((r) => [usageKey(r.grp, r.code), r.n]));
  }
}
