import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { applySegments, collectSegments } from '@remak/shared/rich-translate';
import type { ProductAiDraft, ProductAiDraftEvent, ProductAiDraftRequest, ProductTranslationInput } from '@remak/shared/contracts/product';
import type { RichDoc } from '@remak/shared/rich-content';
import { PrismaService } from '../prisma/prisma.service.js';
import { TranslationService } from '../translation/translation.service.js';
import { resolveUniqueSlug } from '../common/unique-slug.js';

export const MAX_TRANSLATE_CHARS = 60_000;

const TEXT_FIELDS = ['name', 'tagline', 'summary', 'coverAlt', 'focusKeyword', 'seoTitle', 'seoDescription'] as const;
const CONTENT_PREFIX = 'c.';
const HIGHLIGHT_PREFIX = 'hl.';
const ADV_TITLE_PREFIX = 'adv.t.';
const ADV_DESC_PREFIX = 'adv.d.';
const FAQ_Q_PREFIX = 'faq.q.';
const FAQ_A_PREFIX = 'faq.a.';

const stripAddedMarkdown = (source: string, translated: string) =>
  source.includes('**') ? translated : translated.replace(/\*\*/g, '').replace(/ {2,}/g, ' ').trim();

@Injectable()
export class ProductsTranslateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translation: TranslationService,
  ) {}

  /**
   * Dịch sản phẩm vi -> en bằng Gemini (NDJSON stream tiến trình).
   * Ưu tiên dùng `request.sourceVi` từ form client nếu có; nếu không thì tải từ DB.
   */
  async aiDraft(
    productId: string | undefined,
    request: ProductAiDraftRequest = {},
    options: { onEvent?: (event: ProductAiDraftEvent) => void; signal?: AbortSignal } = {},
  ): Promise<ProductAiDraft> {
    let vi: ProductTranslationInput | null = request.sourceVi ?? null;
    let existingEnSlug: string | null = request.currentEnSlug ?? null;
    let sourceUpdatedAt: string | undefined;

    if (!vi && productId && productId !== 'new') {
      const product = await this.prisma.product.findFirst({
        where: { id: productId, deletedAt: null },
        include: { translations: { where: { locale: { in: ['vi', 'en'] } } } },
      });
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
      const viRow = product.translations.find((t) => t.locale === 'vi');
      if (!viRow) throw new BadRequestException('Sản phẩm chưa có bản tiếng Việt để dịch');
      const enRow = product.translations.find((t) => t.locale === 'en');
      if (enRow?.slug) existingEnSlug = enRow.slug;
      sourceUpdatedAt = viRow.contentUpdatedAt.toISOString();

      vi = {
        status: viRow.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        name: viRow.name,
        slug: viRow.slug,
        tagline: viRow.tagline,
        summary: viRow.summary,
        description: viRow.description,
        highlights: viRow.highlights ?? [],
        advantages: (viRow.advantages as { title: string; desc: string }[]) ?? [],
        faqs: (viRow.faqs as { q: string; a: string }[]) ?? [],
        coverAlt: viRow.coverAlt ?? '',
        seoTitle: viRow.seoTitle,
        seoDescription: viRow.seoDescription,
        focusKeyword: viRow.focusKeyword,
        noindex: viRow.noindex,
      };
    }

    if (!vi || !vi.name.trim()) {
      throw new BadRequestException('Chưa có nội dung tiếng Việt (tên sản phẩm bắt buộc) để dịch');
    }

    const fields: Record<string, string> = {};

    // 1. Các trường text đơn
    for (const key of TEXT_FIELDS) {
      const val = vi[key];
      if (typeof val === 'string' && val.trim()) fields[key] = val;
    }

    // 2. Điểm nổi bật (highlights)
    if (Array.isArray(vi.highlights)) {
      vi.highlights.forEach((h, i) => {
        if (typeof h === 'string' && h.trim()) fields[`${HIGHLIGHT_PREFIX}${i}`] = h;
      });
    }

    // 3. Ưu điểm (advantages)
    if (Array.isArray(vi.advantages)) {
      vi.advantages.forEach((adv, i) => {
        if (adv && typeof adv.title === 'string' && adv.title.trim()) {
          fields[`${ADV_TITLE_PREFIX}${i}`] = adv.title;
        }
        if (adv && typeof adv.desc === 'string' && adv.desc.trim()) {
          fields[`${ADV_DESC_PREFIX}${i}`] = adv.desc;
        }
      });
    }

    // 4. Câu hỏi thường gặp (faqs)
    if (Array.isArray(vi.faqs)) {
      vi.faqs.forEach((faq, i) => {
        if (faq && typeof faq.q === 'string' && faq.q.trim()) {
          fields[`${FAQ_Q_PREFIX}${i}`] = faq.q;
        }
        if (faq && typeof faq.a === 'string' && faq.a.trim()) {
          fields[`${FAQ_A_PREFIX}${i}`] = faq.a;
        }
      });
    }

    // 5. Nội dung mô tả chi tiết (RichDoc)
    const content = (vi.description && typeof vi.description === 'object' && 'type' in vi.description
      ? vi.description
      : { type: 'doc', content: [] }) as RichDoc;
    const segments = collectSegments(content);
    for (const [key, text] of Object.entries(segments)) {
      fields[`${CONTENT_PREFIX}${key}`] = text;
    }

    const total = Object.values(fields).reduce((n, s) => n + s.length, 0);
    if (total > MAX_TRANSLATE_CHARS) {
      throw new BadRequestException(
        `Nội dung quá dài để dịch một lần (${total.toLocaleString('vi-VN')} ký tự, tối đa ${MAX_TRANSLATE_CHARS.toLocaleString('vi-VN')})`,
      );
    }

    const segmentKeys = Object.keys(segments);
    options.onEvent?.({
      type: 'prepare',
      fields: Object.keys(fields).length,
      chars: total,
      blocks: segmentKeys.filter((k) => k.startsWith('t')).length,
      images: segmentKeys.filter((k) => k.startsWith('alt')).length,
    });

    // Gọi Gemini qua TranslationService
    const raw = await this.translation.translate(fields, 'product-catalog', {
      signal: options.signal,
      onProgress: (p) => options.onEvent?.({ type: 'progress', ...p }),
    });

    options.onEvent?.({ type: 'assemble' });

    const translated = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, stripAddedMarkdown(fields[k] ?? '', v)]),
    );

    // Ghép RichDoc
    const contentTranslated = Object.fromEntries(
      Object.entries(translated)
        .filter(([k]) => k.startsWith(CONTENT_PREFIX))
        .map(([k, v]) => [k.slice(CONTENT_PREFIX.length), v]),
    );
    const { doc, fallbackBlocks } = applySegments(content, contentTranslated);

    // Ghép highlights
    const highlights: string[] = (vi.highlights ?? []).map((orig, i) => translated[`${HIGHLIGHT_PREFIX}${i}`] ?? orig);

    // Ghép advantages
    const advantages = (vi.advantages ?? []).map((orig, i) => ({
      title: translated[`${ADV_TITLE_PREFIX}${i}`] ?? orig.title,
      desc: translated[`${ADV_DESC_PREFIX}${i}`] ?? orig.desc,
    }));

    // Ghép FAQs
    const faqs = (vi.faqs ?? []).map((orig, i) => ({
      q: translated[`${FAQ_Q_PREFIX}${i}`] ?? orig.q,
      a: translated[`${FAQ_A_PREFIX}${i}`] ?? orig.a,
    }));

    const title = translated.name ?? vi.name;

    // Slug: Giữ slug tiếng Anh cũ nếu có; nếu chưa có thì sinh từ tiêu đề tiếng Anh
    const slug =
      existingEnSlug?.trim() ||
      (await resolveUniqueSlug({
        fromText: title,
        isTaken: async (s) =>
          (await this.prisma.productTranslation.count({
            where: {
              locale: 'en',
              slug: s,
              ...(productId && productId !== 'new' ? { productId: { not: productId } } : {}),
            },
          })) > 0,
      }));

    return {
      status: 'DRAFT',
      name: title,
      slug,
      tagline: translated.tagline ?? null,
      summary: translated.summary ?? '',
      description: doc,
      highlights,
      advantages,
      faqs,
      coverAlt: translated.coverAlt ?? '',
      seoTitle: translated.seoTitle ?? null,
      seoDescription: translated.seoDescription ?? null,
      focusKeyword: translated.focusKeyword ?? null,
      noindex: vi.noindex,
      origin: 'AI',
      fallbackBlocks: fallbackBlocks.length,
      sourceUpdatedAt,
    };
  }
}
