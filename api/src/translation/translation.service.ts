import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { GoogleGenAI, ApiError } from '@google/genai';
import { RedisService } from '../redis/redis.service.js';
import { GLOSSARY_VI_EN, KEEP_AS_IS } from './glossary.js';
import type { TranslateContext } from './dto/translate.dto.js';

const CACHE_TTL = 30 * 24 * 60 * 60; // 30 ngày: cùng câu nguồn -> dùng lại, không tốn phí gọi LLM
// Link nội bộ/anchor/URL không dịch (FE tự đổi /san-pham -> /en/products)
const LINK_LIKE = /^(\/|#|https?:\/\/)\S*$/;

const CONTEXT_STYLE: Record<TranslateContext, string> = {
  'homepage-hero':
    'Homepage hero of a B2B manufacturer website: punchy headline, concise persuasive copy, short button labels and stat captions.',
  'news-article':
    'Technical news article for construction and fire-protection professionals: accurate, natural journalistic US English; keep headings concise, keep the meaning of standards, test results and figures exact.',
  general: 'Website content for a B2B building-materials manufacturer.',
};

/** Mỗi lần gọi Gemini tối đa bấy nhiêu ô / ký tự — bài dài được chia nhiều lô */
const BATCH_MAX_FIELDS = 40;
const BATCH_MAX_CHARS = 6_000;
/** Số lô gọi song song (vừa đủ nhanh, không dồn quota) */
const BATCH_CONCURRENCY = 2;

function systemPrompt(context: TranslateContext) {
  const glossary = GLOSSARY_VI_EN.map(([vi, en]) => `- "${vi}" => "${en}"`).join('\n');
  return [
    'You are a professional Vietnamese-to-English translator for Remak, a manufacturer of fire-rated MgO (magnesium oxide) boards.',
    'Translate every value into natural, native-sounding US English used by construction and fire-protection professionals.',
    CONTEXT_STYLE[context],
    'Rules:',
    '- Return JSON with exactly the same keys as the input; translate values only.',
    '- Keep markdown bold markers **like this** around the corresponding translated words.',
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

const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);

// Lỗi tạm thời phía Google (quá tải, giới hạn tốc độ, timeout) -> đáng thử lại / đổi model
const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);
// Tổng thời gian tối đa cho 1 lần bấm (kể cả thử lại) để CMS không chờ quá lâu
const TOTAL_BUDGET_MS = 45_000;

/** Lỗi lần gọi: tạm thời (thử lại được) hay vĩnh viễn (sai key, sai request) */
function classify(err: unknown): { transient: boolean; status: number | null; detail: string } {
  if (err instanceof ApiError) {
    return { transient: TRANSIENT_STATUS.has(err.status), status: err.status, detail: `HTTP ${err.status}` };
  }
  const name = (err as Error)?.name ?? 'Error';
  // AbortSignal.timeout -> TimeoutError/AbortError: coi là tạm thời
  const transient = name === 'TimeoutError' || name === 'AbortError';
  return { transient, status: null, detail: name };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class TranslationService implements OnModuleInit {
  private readonly logger = new Logger(TranslationService.name);
  private client: GoogleGenAI | null = null;
  private readonly model: string;
  private readonly fallbackModel: string | null;
  private readonly timeoutMs: number;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.model = config.get<string>('translation.geminiModel', 'gemini-3.8-flash');
    this.fallbackModel = config.get<string>('translation.geminiFallbackModel') || null;
    this.timeoutMs = config.get<number>('translation.timeoutMs', 30_000);
  }

  onModuleInit() {
    const apiKey = this.config.get<string>('translation.geminiApiKey');
    if (apiKey) this.client = new GoogleGenAI({ apiKey });
    else this.logger.warn('GEMINI_API_KEY chưa cấu hình — tính năng dịch tự động đang tắt');
  }

  /**
   * Dịch các ô { khoá: câu tiếng Việt } sang tiếng Anh. Trả đúng tập khoá đã gửi.
   * Ô rỗng giữ rỗng; ô là đường dẫn giữ nguyên; câu đã dịch trước đó lấy từ cache.
   */
  async translate(fields: Record<string, string>, context: TranslateContext): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const pending: [string, string][] = [];

    for (const [key, raw] of Object.entries(fields)) {
      const text = raw.trim();
      if (!text || LINK_LIKE.test(text)) {
        result[key] = text;
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
    for (let i = 0; i < batches.length; i += BATCH_CONCURRENCY) {
      await Promise.all(
        batches.slice(i, i + BATCH_CONCURRENCY).map(async (batch) => {
          const translated = await this.callGemini(batch.map(([, text]) => text), context);
          await Promise.all(
            batch.map(async ([key, text], j) => {
              result[key] = translated[j];
              await this.redis.setJson(this.cacheKey(context, text), translated[j], CACHE_TTL);
            }),
          );
        }),
      );
    }
    return result;
  }

  /** Gửi các câu dưới khoá f0..fN (khoá ngắn, an toàn cho JSON schema), nhận lại đúng các khoá đó. */
  private async callGemini(texts: string[], context: TranslateContext): Promise<string[]> {
    if (!this.client) throw new ServiceUnavailableException('Chưa cấu hình dịch tự động (thiếu GEMINI_API_KEY)');

    const keys = texts.map((_, i) => `f${i}`);
    const input = Object.fromEntries(keys.map((k, i) => [k, texts[i]]));
    const schema = {
      type: 'object',
      properties: Object.fromEntries(keys.map((k) => [k, { type: 'string' }])),
      required: keys,
      additionalProperties: false,
    };

    // Lịch thử: model chính 2 lần (chờ ~1s), rồi model dự phòng 2 lần (chờ ~2s) — chỉ khi lỗi tạm thời
    const plan = [this.model, this.model, ...(this.fallbackModel ? [this.fallbackModel, this.fallbackModel] : [])];
    const started = Date.now();
    let lastStatus: number | null = null;

    for (let attempt = 0; attempt < plan.length; attempt++) {
      const model = plan[attempt];
      const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
      if (remaining < 3_000) break;
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: JSON.stringify(input),
          config: {
            systemInstruction: systemPrompt(context),
            responseMimeType: 'application/json',
            responseJsonSchema: schema,
            temperature: 0.2,
            abortSignal: AbortSignal.timeout(Math.min(this.timeoutMs, remaining)),
          },
        });
        if (attempt > 0) this.logger.warn(`Gemini dịch thành công ở lần thử ${attempt + 1} (model ${model})`);
        return this.parse(response.text, keys);
      } catch (err) {
        // Kết quả sai định dạng: thử lại cũng có ích (LLM không tất định) — trừ khi đã hết lượt
        if (err instanceof BadGatewayException && attempt < plan.length - 1) {
          this.logger.warn(`Gemini trả kết quả không hợp lệ (model ${model}), thử lại`);
          continue;
        }
        if (err instanceof BadGatewayException) throw err;

        const { transient, status, detail } = classify(err);
        lastStatus = status;
        this.logger.warn(`Gemini lỗi lần ${attempt + 1}/${plan.length} (model ${model}): ${detail}`);
        if (status === 400 || status === 401 || status === 403) {
          throw new ServiceUnavailableException('Cấu hình dịch tự động không hợp lệ (kiểm tra GEMINI_API_KEY / GEMINI_MODEL)');
        }
        if (!transient) break;
        // Chờ tăng dần + ngẫu nhiên để không dồn request vào lúc Google đang quá tải
        if (attempt < plan.length - 1) await sleep(Math.min(1000 * 2 ** Math.floor(attempt / 2) + Math.random() * 400, 4000));
      }
    }

    this.logger.error(`Gemini không dịch được sau khi thử lại (lỗi cuối: ${lastStatus ?? 'không rõ'})`);
    if (lastStatus === 429) throw new BadGatewayException('Dịch vụ AI đang giới hạn lượt gọi, vui lòng thử lại sau ít phút');
    if (lastStatus === 503 || lastStatus === 500 || lastStatus === 502 || lastStatus === 504) {
      throw new BadGatewayException('Dịch vụ AI của Google đang quá tải, vui lòng thử lại sau ít phút');
    }
    throw new BadGatewayException('Không dịch được lúc này, vui lòng thử lại');
  }

  private parse(text: string | undefined, keys: string[]): string[] {
    let data: unknown;
    try {
      data = JSON.parse(text ?? '');
    } catch {
      throw new BadGatewayException('Kết quả dịch không hợp lệ, vui lòng thử lại');
    }
    const obj = data as Record<string, unknown>;
    if (!obj || typeof obj !== 'object' || keys.some((k) => typeof obj[k] !== 'string' || !(obj[k] as string).trim())) {
      throw new BadGatewayException('Kết quả dịch không hợp lệ, vui lòng thử lại');
    }
    return keys.map((k) => (obj[k] as string).trim());
  }

  private cacheKey(context: TranslateContext, text: string) {
    return `translate:vi-en:${this.model}:${context}:${sha(text)}`;
  }
}
