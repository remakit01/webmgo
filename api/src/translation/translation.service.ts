import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RedisService } from '../redis/redis.service.js';
import { GeminiService, InvalidAiOutputError } from '../ai/gemini.service.js';
import { GLOSSARY_VI_EN, KEEP_AS_IS } from './glossary.js';
import type { TranslateContext } from './dto/translate.dto.js';

/** Phiên bản prompt — đổi prompt thì tăng để cache dịch cũ (theo prompt cũ) không bị dùng lại */
const PROMPT_VERSION = 'p2';
const CACHE_TTL = 30 * 24 * 60 * 60; // 30 ngày: cùng câu nguồn -> dùng lại, không tốn phí gọi LLM
// Link nội bộ/anchor/URL không dịch (FE tự đổi /san-pham -> /en/products)
const LINK_LIKE = /^(\/|#|https?:\/\/)\S*$/;

const CONTEXT_STYLE: Record<TranslateContext, string> = {
  'homepage-hero':
    'Homepage hero of a B2B manufacturer website: punchy headline, concise persuasive copy, short button labels and stat captions.',
  'news-article':
    'Technical news article for construction and fire-protection professionals: accurate, natural journalistic US English; keep headings concise, keep the meaning of standards, test results and figures exact.',
  'product-catalog':
    'B2B building materials product catalog for fire-rated magnesium oxide (MgO) boards: clear technical product naming, concise benefits, accurate specifications, professional copy for architects, contractors and fire-safety engineers.',
  general: 'Website content for a B2B building-materials manufacturer.',
};

/** Mỗi lần gọi Gemini tối đa bấy nhiêu ô / ký tự — lô nhỏ + chạy song song: bài dài xong nhanh hơn và báo tiến trình dày hơn */
const BATCH_MAX_FIELDS = 15;
const BATCH_MAX_CHARS = 3_000;
/** Số lô gọi song song (vừa đủ nhanh, không dồn quota) */
const BATCH_CONCURRENCY = 3;

function systemPrompt(context: TranslateContext) {
  const glossary = GLOSSARY_VI_EN.map(([vi, en]) => `- "${vi}" => "${en}"`).join('\n');
  return [
    'You are a professional Vietnamese-to-English translator for Remak, a manufacturer of fire-rated MgO (magnesium oxide) boards.',
    'Translate every value into natural, native-sounding US English used by construction and fire-protection professionals.',
    CONTEXT_STYLE[context],
    'Rules:',
    '- Return JSON with exactly the same keys as the input; translate values only.',
    // Hero dùng **đậm** kiểu markdown; nội dung bài viết dùng thẻ giữ chỗ -> cấm markdown để AI không tự chèn **
    context === 'homepage-hero'
      ? '- Keep markdown bold markers **like this** around the corresponding translated words.'
      : '- Output plain text: never add markdown (**, __, #, backticks) or any formatting that is not in the source.',
    '- Keep inline tags such as <b>…</b>, <i>…</i>, <u>…</u>, <s>…</s>, <code>…</code>, <a1>…</a1>, <br/> exactly as given (same tag names, properly nested), placed around the corresponding translated words; never add new tags. Keep &lt; &gt; &amp; entities as-is.',
    '- Keep numbers and units; use English number formatting (e.g. "1.200°C" -> "1,200°C", "18.500 m²" -> "18,500 m²").',
    `- Never translate these terms: ${KEEP_AS_IS.join(', ')}.`,
    '- Keep each value about as short as the source (UI fields have length limits); keep button labels short.',
    '- Keep the same capitalization style as the source (Title Case stays Title Case).',
    '- Do not add explanations, quotes or extra text.',
    'Glossary (use these translations):',
    glossary,
  ].join('\n');
}

/** Tiến trình dịch: số ô đã có bản dịch (gồm ô lấy từ cache) / tổng số ô cần dịch, và số lô gọi Gemini */
export interface TranslateProgress {
  total: number;
  done: number;
  cached: number;
  batchesTotal: number;
  batchesDone: number;
}

export interface TranslateOptions {
  onProgress?: (progress: TranslateProgress) => void;
  /** Huỷ giữa chừng: kiểm tra trước mỗi lô */
  signal?: AbortSignal;
}

/** Người dùng huỷ dịch giữa chừng (không phải lỗi dịch vụ) */
export class TranslationAbortedError extends Error {
  constructor() {
    super('Đã huỷ dịch');
  }
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);

@Injectable()
export class TranslationService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Dịch các ô { khoá: câu tiếng Việt } sang tiếng Anh. Trả đúng tập khoá đã gửi.
   * Ô rỗng giữ rỗng; ô là đường dẫn giữ nguyên; câu đã dịch trước đó lấy từ cache.
   */
  async translate(
    fields: Record<string, string>,
    context: TranslateContext,
    options: TranslateOptions = {},
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const pending: [string, string][] = [];
    let skipped = 0;

    for (const [key, raw] of Object.entries(fields)) {
      const text = raw.trim();
      if (!text || LINK_LIKE.test(text)) {
        result[key] = text;
        skipped++;
        continue;
      }
      const cached = await this.redis.getJson<string>(this.cacheKey(context, text));
      if (cached) result[key] = cached;
      else pending.push([key, text]);
    }

    // Chia lô theo số ô / tổng ký tự để mỗi lần gọi nằm trong giới hạn thời gian và độ dài phản hồi
    const batches: [string, string][][] = [];
    for (const item of pending) {
      const last = batches[batches.length - 1];
      const size = last?.reduce((n, [, t]) => n + t.length, 0) ?? 0;
      if (!last || last.length >= BATCH_MAX_FIELDS || size + item[1].length > BATCH_MAX_CHARS) batches.push([item]);
      else last.push(item);
    }

    const total = Object.keys(fields).length - skipped;
    const progress: TranslateProgress = {
      total,
      done: total - pending.length,
      cached: total - pending.length,
      batchesTotal: batches.length,
      batchesDone: 0,
    };
    options.onProgress?.({ ...progress });

    for (let i = 0; i < batches.length; i += BATCH_CONCURRENCY) {
      // Người dùng huỷ (đóng dialog) -> dừng trước lô kế tiếp, không tốn thêm lượt gọi LLM
      if (options.signal?.aborted) throw new TranslationAbortedError();
      await Promise.all(
        batches.slice(i, i + BATCH_CONCURRENCY).map(async (batch) => {
          const translated = await this.callGemini(batch.map(([, text]) => text), context);
          await Promise.all(
            batch.map(async ([key, text], j) => {
              result[key] = translated[j];
              await this.redis.setJson(this.cacheKey(context, text), translated[j], CACHE_TTL);
            }),
          );
          progress.done += batch.length;
          progress.batchesDone += 1;
          options.onProgress?.({ ...progress });
        }),
      );
    }
    return result;
  }

  /** Gửi các câu dưới khoá f0..fN (khoá ngắn, an toàn cho JSON schema), nhận lại đúng các khoá đó. */
  private callGemini(texts: string[], context: TranslateContext): Promise<string[]> {
    const keys = texts.map((_, i) => `f${i}`);
    return this.gemini.generateJson({
      system: systemPrompt(context),
      contents: JSON.stringify(Object.fromEntries(keys.map((k, i) => [k, texts[i]]))),
      schema: {
        type: 'object',
        properties: Object.fromEntries(keys.map((k) => [k, { type: 'string' }])),
        required: keys,
        additionalProperties: false,
      },
      parse: (data) => {
        const obj = data as Record<string, unknown>;
        if (!obj || typeof obj !== 'object' || keys.some((k) => typeof obj[k] !== 'string' || !(obj[k] as string).trim())) {
          throw new InvalidAiOutputError('thiếu hoặc rỗng khoá bản dịch');
        }
        return keys.map((k) => (obj[k] as string).trim());
      },
    });
  }

  /** PROMPT_VERSION: tăng khi đổi prompt để không dùng lại bản dịch cũ trong cache */
  private cacheKey(context: TranslateContext, text: string) {
    return `translate:vi-en:${PROMPT_VERSION}:${this.gemini.model}:${context}:${sha(text)}`;
  }
}
