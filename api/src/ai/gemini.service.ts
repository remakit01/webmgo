import { BadGatewayException, Injectable, Logger, ServiceUnavailableException, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiError, GoogleGenAI } from '@google/genai';
import { addCitationMarkers } from './citations.js';

/**
 * Client Gemini dùng chung cho mọi tính năng AI (dịch, viết bài...): thử lại khi lỗi tạm thời, chuyển model dự phòng,
 * giới hạn tổng thời gian, chuẩn hoá lỗi thành thông báo tiếng Việt (CMS hiển thị trực tiếp).
 * Cấu hình đọc từ `translation.*` (GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, TRANSLATE_TIMEOUT_MS).
 */

// Lỗi tạm thời phía Google (quá tải, giới hạn tốc độ, timeout) -> đáng thử lại / đổi model
const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);
const DEFAULT_BUDGET_MS = 45_000;
/** Số chiều vector embedding (đủ tốt cho tra cứu, nhẹ khi lưu real[] trong Postgres) */
export const EMBEDDING_DIMS = 768;
/** Số đoạn mỗi lần gọi embedContent */
const EMBED_BATCH = 50;

export type EmbeddingTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

/** Kết quả AI sai định dạng (JSON hỏng, thiếu khoá...) — thử lại có ích vì LLM không tất định */
export class InvalidAiOutputError extends Error {}

export interface GroundedSource {
  title: string;
  url: string;
}

export interface GroundedResult {
  text: string;
  sources: GroundedSource[];
  /** HTML "Search Suggestions" của Google — điều khoản Grounding yêu cầu hiển thị nguyên văn cho người dùng */
  searchEntryPointHtml: string | null;
  /** Các truy vấn Google mà Gemini đã tự chạy (fan-out) */
  webSearchQueries: string[];
}

interface CallOptions {
  /** Tổng thời gian tối đa kể cả thử lại */
  budgetMs?: number;
  /** Thời gian tối đa một lần gọi (mặc định TRANSLATE_TIMEOUT_MS) — tìm Google cần lâu hơn */
  timeoutMs?: number;
  signal?: AbortSignal;
}

/** Lỗi lần gọi: tạm thời (thử lại được) hay vĩnh viễn (sai key, sai request) */
function classify(err: unknown): { transient: boolean; status: number | null; detail: string } {
  if (err instanceof ApiError) {
    // Kèm thông báo của Google (vd quota nào bị vượt) để chẩn đoán — không chứa API key
    const quota = [...err.message.matchAll(/"quota(?:Metric|Id)"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
    const reason = quota.length ? `quota: ${[...new Set(quota)].join(', ')}` : err.message.replace(/\s+/g, ' ').slice(0, 300);
    return { transient: TRANSIENT_STATUS.has(err.status), status: err.status, detail: `HTTP ${err.status} ${reason}` };
  }
  const name = (err as Error)?.name ?? 'Error';
  // AbortSignal.timeout -> TimeoutError/AbortError: coi là tạm thời
  const transient = name === 'TimeoutError' || name === 'AbortError';
  return { transient, status: null, detail: name };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  client: GoogleGenAI | null = null;
  readonly model: string;
  private readonly fallbackModel: string | null;
  private readonly timeoutMs: number;
  /** Model embedding (tra cứu kho kiến thức theo ngữ nghĩa) */
  readonly embeddingModel: string;

  constructor(private readonly config: ConfigService) {
    this.embeddingModel = config.get<string>('translation.geminiEmbeddingModel', 'gemini-embedding-001');
    this.model = config.get<string>('translation.geminiModel', 'gemini-3.8-flash');
    this.fallbackModel = config.get<string>('translation.geminiFallbackModel') || null;
    this.timeoutMs = config.get<number>('translation.timeoutMs', 30_000);
  }

  onModuleInit() {
    const apiKey = this.config.get<string>('translation.geminiApiKey');
    if (apiKey) this.client = new GoogleGenAI({ apiKey });
    else this.logger.warn('GEMINI_API_KEY chưa cấu hình — các tính năng AI (dịch, viết bài) đang tắt');
  }

  /**
   * Gọi Gemini trả JSON theo schema; `parse` kiểm tra/chuyển dữ liệu (ném InvalidAiOutputError nếu sai -> thử lại).
   */
  async generateJson<T>(
    req: { system: string; contents: string; schema: object; temperature?: number; parse: (data: unknown) => T },
    options: CallOptions = {},
  ): Promise<T> {
    return this.run(async (client, model, signal) => {
      const response = await client.models.generateContent({
        model,
        contents: req.contents,
        config: {
          systemInstruction: req.system,
          responseMimeType: 'application/json',
          responseJsonSchema: req.schema,
          temperature: req.temperature ?? 0.2,
          abortSignal: signal,
        },
      });
      let data: unknown;
      try {
        data = JSON.parse(response.text ?? '');
      } catch {
        throw new InvalidAiOutputError('JSON không hợp lệ');
      }
      return req.parse(data);
    }, options);
  }

  /**
   * Gọi Gemini có công cụ Google Search (grounding): trả văn bản (có số trích dẫn [n] theo `sources`) + nguồn web thật + HTML gợi ý tìm kiếm.
   * Không dùng chung với responseJsonSchema — cấu trúc lại kết quả bằng một lần generateJson sau đó.
   */
  async generateGrounded(req: { system: string; prompt: string; temperature?: number }, options: CallOptions = {}): Promise<GroundedResult> {
    return this.run(async (client, model, signal) => {
      const response = await client.models.generateContent({
        model,
        contents: req.prompt,
        config: {
          systemInstruction: req.system,
          tools: [{ googleSearch: {} }],
          temperature: req.temperature ?? 0.3,
          abortSignal: signal,
        },
      });
      if (!response.text?.trim()) throw new InvalidAiOutputError('Kết quả tìm kiếm rỗng');
      const candidate = response.candidates?.[0];
      const meta = candidate?.groundingMetadata;
      const sources: GroundedSource[] = [];
      const indexByUrl = new Map<string, number>();
      // groundingChunk i -> số thứ tự nguồn (1-based, đã bỏ trùng URL); 0 = không phải nguồn web
      const chunkToSource = (meta?.groundingChunks ?? []).map((chunk) => {
        const url = chunk.web?.uri;
        if (!url) return 0;
        if (!indexByUrl.has(url)) {
          sources.push({ title: chunk.web?.title || chunk.web?.domain || url, url });
          indexByUrl.set(url, sources.length);
        }
        return indexByUrl.get(url)!;
      });
      const parts = (candidate?.content?.parts ?? []).map((p) => (typeof p.text === 'string' && !p.thought ? p.text : ''));
      const text = (parts.some(Boolean) ? addCitationMarkers(parts, meta?.groundingSupports ?? [], chunkToSource) : response.text).trim();
      return {
        text,
        sources,
        searchEntryPointHtml: meta?.searchEntryPoint?.renderedContent ?? null,
        webSearchQueries: meta?.webSearchQueries ?? [],
      };
    }, options);
  }

  /** Gọi Gemini trả văn bản tự do, không công cụ (dự phòng khi Google Search không dùng được) */
  async generateText(req: { system: string; prompt: string; temperature?: number }, options: CallOptions = {}): Promise<string> {
    return this.run(async (client, model, signal) => {
      const response = await client.models.generateContent({
        model,
        contents: req.prompt,
        config: { systemInstruction: req.system, temperature: req.temperature ?? 0.3, abortSignal: signal },
      });
      const text = response.text?.trim();
      if (!text) throw new InvalidAiOutputError('Kết quả rỗng');
      return text;
    }, options);
  }

  /**
   * Embedding cho danh sách đoạn văn (chia lô EMBED_BATCH). Thứ tự vector khớp thứ tự đầu vào.
   * Chỉ dùng model embedding (không có model dự phòng) — caller tự lùi về tìm theo từ khoá khi lỗi.
   */
  async embed(texts: string[], taskType: EmbeddingTask, options: CallOptions = {}): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += EMBED_BATCH) {
      const batch = texts.slice(i, i + EMBED_BATCH);
      const vectors = await this.run(
        async (client, model, signal) => {
          const res = await client.models.embedContent({
            model,
            contents: batch,
            config: { taskType, outputDimensionality: EMBEDDING_DIMS, abortSignal: signal },
          });
          const values = (res.embeddings ?? []).map((e) => e.values ?? []);
          if (values.length !== batch.length || values.some((v) => !v.length)) throw new InvalidAiOutputError('Embedding thiếu vector');
          return values;
        },
        { ...options, models: [this.embeddingModel, this.embeddingModel] },
      );
      out.push(...vectors);
    }
    return out;
  }

  /**
   * Lịch thử: model chính 2 lần (chờ ~1s), rồi model dự phòng 2 lần (chờ ~2s) — chỉ khi lỗi tạm thời / kết quả sai định dạng.
   */
  private async run<T>(
    call: (client: GoogleGenAI, model: string, signal: AbortSignal) => Promise<T>,
    options: CallOptions & { models?: string[] },
  ): Promise<T> {
    if (!this.client) throw new ServiceUnavailableException('Chưa cấu hình AI (thiếu GEMINI_API_KEY)');
    const client = this.client;
    const plan = options.models ?? [this.model, this.model, ...(this.fallbackModel ? [this.fallbackModel, this.fallbackModel] : [])];
    const budget = options.budgetMs ?? DEFAULT_BUDGET_MS;
    const started = Date.now();
    let lastStatus: number | null = null;
    let invalidOutput = false;

    for (let attempt = 0; attempt < plan.length; attempt++) {
      if (options.signal?.aborted) throw options.signal.reason ?? new Error('aborted');
      const model = plan[attempt];
      const remaining = budget - (Date.now() - started);
      if (remaining < 3_000) break;
      const timeout = AbortSignal.timeout(Math.min(options.timeoutMs ?? this.timeoutMs, remaining));
      const signal = options.signal ? AbortSignal.any([timeout, options.signal]) : timeout;
      try {
        const result = await call(client, model, signal);
        if (attempt > 0) this.logger.warn(`Gemini thành công ở lần thử ${attempt + 1} (model ${model})`);
        return result;
      } catch (err) {
        if (options.signal?.aborted) throw err;
        if (err instanceof InvalidAiOutputError) {
          invalidOutput = true;
          this.logger.warn(`Gemini trả kết quả không hợp lệ (model ${model}): ${err.message}`);
          continue;
        }
        const { transient, status, detail } = classify(err);
        lastStatus = status;
        invalidOutput = false;
        this.logger.warn(`Gemini lỗi lần ${attempt + 1}/${plan.length} (model ${model}): ${detail}`);
        if (status === 400 || status === 401 || status === 403) {
          throw new ServiceUnavailableException('Cấu hình AI không hợp lệ (kiểm tra GEMINI_API_KEY / GEMINI_MODEL)');
        }
        if (!transient) break;
        // Chờ tăng dần + ngẫu nhiên để không dồn request vào lúc Google đang quá tải
        if (attempt < plan.length - 1) await sleep(Math.min(1000 * 2 ** Math.floor(attempt / 2) + Math.random() * 400, 4000));
      }
    }

    this.logger.error(`Gemini không phản hồi được sau khi thử lại (lỗi cuối: ${lastStatus ?? (invalidOutput ? 'sai định dạng' : 'không rõ')})`);
    if (invalidOutput) throw new BadGatewayException('Kết quả AI không hợp lệ, vui lòng thử lại');
    if (lastStatus === 429) throw new BadGatewayException('Dịch vụ AI đang giới hạn lượt gọi, vui lòng thử lại sau ít phút');
    if (lastStatus === 503 || lastStatus === 500 || lastStatus === 502 || lastStatus === 504) {
      throw new BadGatewayException('Dịch vụ AI của Google đang quá tải, vui lòng thử lại sau ít phút');
    }
    throw new BadGatewayException('Dịch vụ AI không phản hồi lúc này, vui lòng thử lại');
  }
}
