import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { AiReindexResult } from '@remak/shared/contracts/ai-knowledge';
import { GeminiService } from '../ai/gemini.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SOURCE_KNOWLEDGE, SOURCE_NEWS, knowledgeChunks, newsChunks, textHash, type EmbeddingSource } from './ai-knowledge.text.js';

interface DesiredChunk {
  sourceType: EmbeddingSource;
  sourceId: string;
  chunk: number;
  text: string;
  hash: string;
}

const key = (c: { sourceType: string; sourceId: string; chunk: number }) => `${c.sourceType}|${c.sourceId}|${c.chunk}`;

/**
 * Lập chỉ mục embedding cho kho kiến thức (ACTIVE) và bài Tin tức tiếng Việt đã đăng.
 * Chỉ nhúng lại đoạn có textHash đổi (không tốn quota cho nội dung cũ), xoá vector của nguồn đã gỡ.
 * Embedding lỗi (hết quota, chưa có key) -> giữ vector cũ, log cảnh báo; tra cứu vẫn chạy bằng từ khoá.
 * Job không dùng lock Redis: thao tác upsert/xoá idempotent, chạy trùng chỉ tốn thêm lượt gọi.
 */
@Injectable()
export class AiIndexService {
  private readonly logger = new Logger(AiIndexService.name);
  private running: Promise<AiReindexResult> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  @Cron('0 */10 * * * *', { name: 'ai-knowledge-index' })
  async scheduled() {
    if (!this.gemini.client) return;
    try {
      const r = await this.syncAll();
      if (r.embedded || r.removed || r.failed) this.logger.log(`Lập chỉ mục AI: +${r.embedded} đoạn, xoá ${r.removed}, lỗi ${r.failed}`);
    } catch (err) {
      this.logger.warn(`Lập chỉ mục AI lỗi: ${(err as Error).message}`);
    }
  }

  /** Đồng bộ toàn bộ (job định kỳ / nút "Lập chỉ mục lại"); lần gọi trùng dùng chung kết quả */
  syncAll(): Promise<AiReindexResult> {
    this.running ??= this.sync().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  /** Đồng bộ ngay một vài mẩu kiến thức vừa lưu — không chặn request (lỗi chỉ log) */
  syncKnowledgeLater(ids: string[]) {
    if (!ids.length || !this.gemini.client) return;
    void this.sync({ knowledgeIds: ids }).catch((err: unknown) => this.logger.warn(`Lập chỉ mục kiến thức lỗi: ${(err as Error).message}`));
  }

  /** Các đoạn cần có của kiến thức (ACTIVE) — dùng cả để tính trạng thái "đã lập chỉ mục" */
  async knowledgeDesired(ids?: string[]): Promise<DesiredChunk[]> {
    const rows = await this.prisma.aiKnowledge.findMany({
      where: { status: 'ACTIVE', ...(ids ? { id: { in: ids } } : {}) },
      select: { id: true, title: true, content: true, tags: true },
    });
    return rows.flatMap((k) =>
      knowledgeChunks(k).map((text, chunk) => ({ sourceType: SOURCE_KNOWLEDGE, sourceId: k.id, chunk, text, hash: textHash(text) })),
    );
  }

  private async newsDesired(): Promise<DesiredChunk[]> {
    const rows = await this.prisma.newsPostTranslation.findMany({
      where: { locale: 'vi', status: 'PUBLISHED', publishedAt: { lte: new Date() }, post: { deletedAt: null } },
      select: { postId: true, title: true, sapo: true, contentText: true },
    });
    return rows.flatMap((n) =>
      newsChunks(n).map((text, chunk) => ({ sourceType: SOURCE_NEWS, sourceId: n.postId, chunk, text, hash: textHash(text) })),
    );
  }

  /** Mẩu kiến thức nào đã có đủ embedding cho nội dung hiện tại */
  async indexedKnowledgeIds(ids?: string[]): Promise<Set<string>> {
    const desired = await this.knowledgeDesired(ids);
    const existing = await this.prisma.aiEmbedding.findMany({
      where: { sourceType: SOURCE_KNOWLEDGE, model: this.gemini.embeddingModel, ...(ids ? { sourceId: { in: ids } } : {}) },
      select: { sourceType: true, sourceId: true, chunk: true, textHash: true },
    });
    const have = new Map(existing.map((e) => [key(e), e.textHash]));
    const missing = new Set(desired.filter((d) => have.get(key(d)) !== d.hash).map((d) => d.sourceId));
    return new Set(desired.map((d) => d.sourceId).filter((id) => !missing.has(id)));
  }

  /** knowledgeIds: chỉ đồng bộ các mẩu đó; bỏ trống: đồng bộ toàn bộ kiến thức + bài Tin tức */
  async sync(scope: { knowledgeIds?: string[] } = {}): Promise<AiReindexResult> {
    const partial = !!scope.knowledgeIds;
    const desired = partial ? await this.knowledgeDesired(scope.knowledgeIds) : [...(await this.knowledgeDesired()), ...(await this.newsDesired())];
    const model = this.gemini.embeddingModel;
    const existing = await this.prisma.aiEmbedding.findMany({
      where: partial ? { model, sourceType: SOURCE_KNOWLEDGE, sourceId: { in: scope.knowledgeIds } } : { model },
      select: { sourceType: true, sourceId: true, chunk: true, textHash: true },
    });
    const have = new Map(existing.map((e) => [key(e), e.textHash]));
    const wanted = new Set(desired.map(key));
    const toEmbed = desired.filter((d) => have.get(key(d)) !== d.hash);
    const toRemove = existing.filter((e) => !wanted.has(key(e)));

    if (toRemove.length) {
      // Gộp theo nguồn: mỗi nguồn một lệnh deleteMany (thay vì xoá từng đoạn)
      const bySource = new Map<string, { sourceType: string; sourceId: string; chunks: number[] }>();
      for (const e of toRemove) {
        const k = `${e.sourceType}|${e.sourceId}`;
        const group = bySource.get(k) ?? { sourceType: e.sourceType, sourceId: e.sourceId, chunks: [] };
        group.chunks.push(e.chunk);
        bySource.set(k, group);
      }
      await this.prisma.$transaction(
        [...bySource.values()].map((g) =>
          this.prisma.aiEmbedding.deleteMany({ where: { model, sourceType: g.sourceType, sourceId: g.sourceId, chunk: { in: g.chunks } } }),
        ),
      );
    }

    let embedded = 0;
    let failed = 0;
    for (let i = 0; i < toEmbed.length; i += 50) {
      const batch = toEmbed.slice(i, i + 50);
      try {
        const vectors = await this.gemini.embed(
          batch.map((b) => b.text),
          'RETRIEVAL_DOCUMENT',
          { budgetMs: 60_000 },
        );
        await this.prisma.$transaction(
          batch.map((b, j) =>
            this.prisma.aiEmbedding.upsert({
              where: { model_sourceType_sourceId_chunk: { model, sourceType: b.sourceType, sourceId: b.sourceId, chunk: b.chunk } },
              create: { sourceType: b.sourceType, sourceId: b.sourceId, chunk: b.chunk, model, textHash: b.hash, text: b.text, vector: vectors[j] },
              update: { textHash: b.hash, text: b.text, vector: vectors[j] },
            }),
          ),
        );
        embedded += batch.length;
      } catch (err) {
        // Hết quota / lỗi mạng: dừng lượt này, giữ vector cũ — lần sau chạy tiếp
        failed = toEmbed.length - embedded;
        this.logger.warn(`Embedding lỗi (${failed} đoạn chờ lần sau): ${(err as Error).message}`);
        break;
      }
    }
    return { embedded, skipped: desired.length - toEmbed.length, removed: toRemove.length, failed };
  }
}
