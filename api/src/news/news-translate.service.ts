import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { applySegments, collectSegments } from '@remak/shared/rich-translate';
import type { NewsAiDraft } from '@remak/shared/contracts/news';
import type { RichDoc } from '@remak/shared/rich-content';
import { PrismaService } from '../prisma/prisma.service.js';
import { TranslationService } from '../translation/translation.service.js';
import { resolveUniqueSlug } from '../common/unique-slug.js';

/** Bài dài hơn mức này phải chia nhỏ trước khi dịch (chặn chi phí LLM bất thường) */
export const MAX_TRANSLATE_CHARS = 60_000;

/** Ô ngoài nội dung được dịch cùng bài */
const TEXT_FIELDS = ['title', 'sapo', 'coverAlt', 'coverCaption', 'seoTitle', 'seoDescription'] as const;
const CONTENT_PREFIX = 'c.';

/**
 * Dịch cả bài vi -> en bằng Gemini (TranslationService dùng chung: glossary, cache từng câu, thử lại, model dự phòng).
 * Chỉ trả BẢN NHÁP cho CMS — không ghi DB; biên tập viên đọc duyệt rồi mới lưu/xuất bản.
 */
@Injectable()
export class NewsTranslateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translation: TranslationService,
  ) {}

  async aiDraft(postId: string): Promise<NewsAiDraft> {
    const post = await this.prisma.newsPost.findFirst({
      where: { id: postId, deletedAt: null },
      include: { translations: { where: { locale: { in: ['vi', 'en'] } } } },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    const vi = post.translations.find((t) => t.locale === 'vi');
    if (!vi) throw new BadRequestException('Bài chưa có bản tiếng Việt để dịch');
    const en = post.translations.find((t) => t.locale === 'en');

    const content = vi.content as unknown as RichDoc;
    const fields: Record<string, string> = {};
    for (const key of TEXT_FIELDS) {
      const value = vi[key];
      if (typeof value === 'string' && value.trim()) fields[key] = value;
    }
    for (const [key, text] of Object.entries(collectSegments(content))) fields[CONTENT_PREFIX + key] = text;

    const total = Object.values(fields).reduce((n, s) => n + s.length, 0);
    if (total > MAX_TRANSLATE_CHARS) {
      throw new BadRequestException(`Bài quá dài để dịch một lần (${total.toLocaleString('vi-VN')} ký tự, tối đa ${MAX_TRANSLATE_CHARS.toLocaleString('vi-VN')})`);
    }

    const translated = await this.translation.translate(fields, 'news-article');
    const contentTranslated = Object.fromEntries(
      Object.entries(translated)
        .filter(([k]) => k.startsWith(CONTENT_PREFIX))
        .map(([k, v]) => [k.slice(CONTENT_PREFIX.length), v]),
    );
    const { doc, fallbackBlocks } = applySegments(content, contentTranslated);
    const title = translated.title ?? vi.title;

    // Đã có bản tiếng Anh thì giữ đường dẫn cũ (không đổi URL bài đã đăng); chưa có thì sinh từ tiêu đề tiếng Anh
    const slug = en?.slug ?? (await resolveUniqueSlug({
      fromText: title,
      isTaken: async (s) => (await this.prisma.newsPostTranslation.count({ where: { locale: 'en', slug: s, postId: { not: postId } } })) > 0,
    }));

    return {
      title,
      slug,
      sapo: translated.sapo ?? '',
      content: doc,
      coverAlt: translated.coverAlt ?? '',
      coverCaption: translated.coverCaption ?? null,
      seoTitle: translated.seoTitle ?? null,
      seoDescription: translated.seoDescription ?? null,
      // Tên nguồn là tên riêng, link nguồn giữ nguyên
      sourceName: vi.sourceName,
      sourceUrl: vi.sourceUrl,
      noindex: vi.noindex,
      origin: 'AI',
      sourceUpdatedAt: vi.contentUpdatedAt.toISOString(),
      fallbackBlocks: fallbackBlocks.length,
    };
  }
}
