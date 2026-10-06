import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AiKnowledgeItem,
  AiKnowledgeStats,
  AiKnowledgeSuggestion,
} from '@remak/shared/contracts/ai-knowledge';
import { normalizePage, toPaginated, type Paginated } from '@remak/shared/pagination';
import { overlapRatio } from '@remak/shared/text-rank';
import type { AiKnowledge, Prisma } from '../generated/prisma/client.js';
import { assertUpdated, assertVersion, versionOf } from '../common/versioning.js';
import { GeminiService } from '../ai/gemini.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiIndexService } from './ai-index.service.js';
import type { AiKnowledgeDto, AiKnowledgeListQueryDto } from './dto/ai-knowledge.dto.js';

/** Kiến thức từ web trùng ≥ mức này với mẩu đã có thì bỏ qua (không lưu trùng) */
export const DUPLICATE_OVERLAP = 0.8;

const toItem = (k: AiKnowledge, indexed: boolean): AiKnowledgeItem => ({
  id: k.id,
  kind: k.kind,
  title: k.title,
  content: k.content,
  tags: k.tags,
  sourceUrl: k.sourceUrl,
  sourceTitle: k.sourceTitle,
  status: k.status,
  origin: k.origin,
  pinned: k.pinned,
  verifiedAt: k.verifiedAt?.toISOString() ?? null,
  indexed,
  createdAt: k.createdAt.toISOString(),
  updatedAt: k.updatedAt.toISOString(),
  version: versionOf(k),
});

/** Kho "Kiến thức AI": CRUD cho CMS; mỗi lần ghi thì lập chỉ mục embedding nền (không chặn request) */
@Injectable()
export class AiKnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly index: AiIndexService,
    private readonly gemini: GeminiService,
  ) {}

  async list(query: AiKnowledgeListQueryDto): Promise<Paginated<AiKnowledgeItem>> {
    const { page, pageSize, skip, take } = normalizePage(query.page, query.pageSize);
    const q = query.q?.trim();
    const where: Prisma.AiKnowledgeWhereInput = {
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.origin ? { origin: query.origin } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.aiKnowledge.findMany({ where, orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }], skip, take }),
      this.prisma.aiKnowledge.count({ where }),
    ]);
    const indexed = await this.index.indexedKnowledgeIds(rows.map((r) => r.id));
    return toPaginated(
      rows.map((r) => toItem(r, indexed.has(r.id))),
      total,
      page,
      pageSize,
    );
  }

  async stats(): Promise<AiKnowledgeStats> {
    const [total, active, indexed] = await Promise.all([
      this.prisma.aiKnowledge.count(),
      this.prisma.aiKnowledge.count({ where: { status: 'ACTIVE' } }),
      this.index.indexedKnowledgeIds(),
    ]);
    return { total, active, indexed: indexed.size, embeddingModel: this.gemini.embeddingModel };
  }

  async get(id: string): Promise<AiKnowledgeItem> {
    const row = await this.getOrThrow(id);
    const indexed = await this.index.indexedKnowledgeIds([id]);
    return toItem(row, indexed.has(id));
  }

  async create(dto: AiKnowledgeDto, userId?: string): Promise<AiKnowledgeItem> {
    const row = await this.prisma.aiKnowledge.create({
      data: {
        kind: dto.kind,
        title: dto.title,
        content: dto.content,
        tags: dto.tags ?? [],
        sourceUrl: dto.sourceUrl ?? null,
        sourceTitle: dto.sourceTitle ?? null,
        pinned: dto.pinned ?? false,
        status: dto.status ?? 'ACTIVE',
        origin: 'HUMAN',
        verifiedAt: new Date(),
        createdById: userId ?? null,
        updatedById: userId ?? null,
      },
    });
    this.index.syncKnowledgeLater([row.id]);
    return toItem(row, false);
  }

  async update(id: string, dto: AiKnowledgeDto, ifMatch: string | undefined, userId?: string): Promise<AiKnowledgeItem> {
    const current = await this.getOrThrow(id);
    assertVersion(ifMatch, current.updatedAt);
    const { count } = await this.prisma.aiKnowledge.updateMany({
      where: { id, updatedAt: current.updatedAt },
      data: {
        kind: dto.kind,
        title: dto.title,
        content: dto.content,
        tags: dto.tags ?? [],
        sourceUrl: dto.sourceUrl ?? null,
        sourceTitle: dto.sourceTitle ?? null,
        pinned: dto.pinned ?? false,
        status: dto.status ?? current.status,
        // Biên tập viên lưu lại = đã kiểm chứng
        verifiedAt: new Date(),
        updatedById: userId ?? null,
      },
    });
    assertUpdated(count);
    this.index.syncKnowledgeLater([id]);
    return this.get(id);
  }

  /** Lưu trữ (AI không dùng nữa, xoá vector); khôi phục bằng update status ACTIVE */
  async archive(id: string, ifMatch: string | undefined, userId?: string): Promise<AiKnowledgeItem> {
    const current = await this.getOrThrow(id);
    assertVersion(ifMatch, current.updatedAt);
    const { count } = await this.prisma.aiKnowledge.updateMany({
      where: { id, updatedAt: current.updatedAt },
      data: { status: 'ARCHIVED', updatedById: userId ?? null },
    });
    assertUpdated(count);
    this.index.syncKnowledgeLater([id]);
    return this.get(id);
  }

  /**
   * Lưu kiến thức từ web biên tập viên đã duyệt (origin AI_WEB). Mẩu trùng nội dung với kho (hoặc trùng nhau) bị bỏ qua.
   * @returns các mẩu đã lưu và số mẩu bỏ qua vì trùng
   */
  async acceptSuggestions(items: AiKnowledgeSuggestion[], userId?: string): Promise<{ created: AiKnowledgeItem[]; skipped: number }> {
    const existing = await this.prisma.aiKnowledge.findMany({ where: { status: 'ACTIVE' }, select: { title: true, content: true } });
    const corpus = existing.map((e) => `${e.title}\n${e.content}`);
    const fresh: AiKnowledgeSuggestion[] = [];
    for (const item of items) {
      const text = `${item.title}\n${item.content}`;
      if (corpus.some((c) => overlapRatio(text, c) >= DUPLICATE_OVERLAP)) continue;
      corpus.push(text);
      fresh.push(item);
    }
    const now = new Date();
    const created = await this.prisma.$transaction(
      fresh.map((item) =>
        this.prisma.aiKnowledge.create({
          data: {
            kind: item.kind,
            title: item.title,
            content: item.content,
            sourceUrl: item.sourceUrl,
            sourceTitle: item.sourceTitle || null,
            origin: 'AI_WEB',
            verifiedAt: now,
            createdById: userId ?? null,
            updatedById: userId ?? null,
          },
        }),
      ),
    );
    this.index.syncKnowledgeLater(created.map((c) => c.id));
    return { created: created.map((c) => toItem(c, false)), skipped: items.length - fresh.length };
  }

  private async getOrThrow(id: string) {
    const row = await this.prisma.aiKnowledge.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy mẩu kiến thức');
    return row;
  }
}
