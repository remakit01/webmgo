import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ApiError } from '@google/genai';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TranslationService } from './translation.service.js';
import { GeminiService } from '../ai/gemini.service.js';
import { TranslateDto } from './dto/translate.dto.js';

function setup(opts: { apiKey?: string; reply?: (input: Record<string, string>) => unknown } = {}) {
  const store = new Map<string, unknown>();
  const redis = {
    getJson: vi.fn(async (k: string) => (store.get(k) as string | undefined) ?? null),
    setJson: vi.fn(async (k: string, v: unknown) => void store.set(k, v)),
  };
  const config = {
    get: (key: string, fallback?: unknown) =>
      key === 'translation.geminiApiKey'
        ? opts.apiKey
        : key === 'translation.geminiFallbackModel'
          ? 'fallback-model'
          : fallback,
  };
  const gemini = new GeminiService(config as never);
  gemini.onModuleInit();
  const service = new TranslationService(gemini, redis as never);

  // Thay client Gemini bằng bản giả: dịch = thêm tiền tố "EN:" (hoặc theo opts.reply)
  const generateContent = vi.fn(async ({ contents }: { contents: string }) => {
    const input = JSON.parse(contents) as Record<string, string>;
    const out = opts.reply ? opts.reply(input) : Object.fromEntries(Object.entries(input).map(([k, v]) => [k, `EN:${v}`]));
    return { text: typeof out === 'string' ? out : JSON.stringify(out) };
  });
  if (opts.apiKey) (gemini as unknown as { client: unknown }).client = { models: { generateContent } };
  return { service, generateContent, redis };
}

describe('TranslationService', () => {
  it('dịch đúng tập khoá; ô rỗng và đường dẫn giữ nguyên, không gửi lên LLM', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    const res = await service.translate(
      { title: 'Tấm MGO', empty: '  ', link: '/nhan-mau-thu', anchor: '#du-toan', 'stats.0.label': 'Chịu nhiệt' },
      'homepage-hero',
    );
    expect(res).toEqual({
      title: 'EN:Tấm MGO',
      empty: '',
      link: '/nhan-mau-thu',
      anchor: '#du-toan',
      'stats.0.label': 'EN:Chịu nhiệt',
    });
    const sent = JSON.parse(generateContent.mock.calls[0][0].contents) as Record<string, string>;
    expect(Object.values(sent)).toEqual(['Tấm MGO', 'Chịu nhiệt']);
  });

  it('câu đã dịch được lấy từ cache, lần 2 không gọi Gemini', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    await service.translate({ a: 'Chịu nhiệt' }, 'homepage-hero');
    const again = await service.translate({ b: 'Chịu nhiệt' }, 'homepage-hero');
    expect(again).toEqual({ b: 'EN:Chịu nhiệt' });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('chưa có key -> 503', async () => {
    const { service } = setup();
    await expect(service.translate({ a: 'Xin chào' }, 'general')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('LLM trả thiếu khoá hoặc không phải JSON -> 502', async () => {
    const missing = setup({ apiKey: 'k', reply: () => ({ f0: 'Hello' }) });
    await expect(missing.service.translate({ a: 'Xin', b: 'chào' }, 'general')).rejects.toBeInstanceOf(BadGatewayException);
    const broken = setup({ apiKey: 'k', reply: () => 'không phải json' });
    await expect(broken.service.translate({ a: 'Xin' }, 'general')).rejects.toBeInstanceOf(BadGatewayException);
  });
});

describe('TranslateDto', () => {
  const errorsOf = async (body: object) => (await validate(plainToInstance(TranslateDto, body))).map((e) => e.property);
  const base = { source: 'vi', target: 'en', context: 'homepage-hero' };

  it('hợp lệ với vài ô chuỗi', async () => {
    expect(await errorsOf({ ...base, fields: { title: 'Xin chào' } })).toEqual([]);
  });

  it('chặn ngôn ngữ khác, ô không phải chuỗi, quá nhiều ô hoặc quá dài', async () => {
    expect(await errorsOf({ ...base, target: 'fr', fields: { a: 'x' } })).toContain('target');
    expect(await errorsOf({ ...base, fields: { a: 1 } })).toContain('fields');
    expect(await errorsOf({ ...base, fields: {} })).toContain('fields');
    const many = Object.fromEntries(Array.from({ length: 61 }, (_, i) => [`k${i}`, 'x']));
    expect(await errorsOf({ ...base, fields: many })).toContain('fields');
    expect(await errorsOf({ ...base, fields: { a: 'x'.repeat(1001) } })).toContain('fields');
  });
});

describe('TranslationService khi Gemini lỗi tạm thời', () => {
  const overloaded = () => new ApiError({ message: 'The model is overloaded', status: 503 });
  const ok = (contents: string) => ({
    text: JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(contents) as Record<string, string>).map(([k, v]) => [k, `EN:${v}`]))),
  });

  it('503 rồi thành công -> tự thử lại, vẫn trả bản dịch', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    generateContent.mockRejectedValueOnce(overloaded());
    expect(await service.translate({ a: 'Xin chào' }, 'general')).toEqual({ a: 'EN:Xin chào' });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('model chính quá tải 2 lần -> chuyển sang model dự phòng', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    generateContent
      .mockRejectedValueOnce(overloaded())
      .mockRejectedValueOnce(overloaded())
      .mockImplementationOnce(async ({ contents }: { contents: string }) => ok(contents));
    expect(await service.translate({ a: 'Chịu nhiệt' }, 'general')).toEqual({ a: 'EN:Chịu nhiệt' });
    const models = (generateContent.mock.calls as unknown as [{ model: string }][]).map((c) => c[0].model);
    expect(models).toEqual(['gemini-3.8-flash', 'gemini-3.8-flash', 'fallback-model']);
  }, 15_000);

  it('sai key (403) -> không thử lại, báo lỗi cấu hình', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    generateContent.mockRejectedValue(new ApiError({ message: 'forbidden', status: 403 }));
    await expect(service.translate({ a: 'Xin' }, 'general')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('quá tải kéo dài -> thử đủ 4 lần rồi báo "đang quá tải"', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    generateContent.mockRejectedValue(overloaded());
    await expect(service.translate({ a: 'Xin' }, 'general')).rejects.toThrow('quá tải');
    expect(generateContent).toHaveBeenCalledTimes(4);
  }, 20_000);
});

describe('TranslationService chia lô (bài dài)', () => {
  it('nhiều ô / nhiều ký tự -> chia nhiều lần gọi, kết quả đủ khoá', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    const fields = Object.fromEntries(Array.from({ length: 95 }, (_, i) => [`c.t${i}`, `Đoạn văn số ${i}`]));
    fields.long = 'x'.repeat(5_900);
    const res = await service.translate(fields, 'news-article');
    expect(Object.keys(res)).toHaveLength(96);
    expect(res['c.t94']).toBe('EN:Đoạn văn số 94');
    // 95 ô ngắn -> lô tối đa 15 ô + ô dài tách lô riêng vì vượt 3.000 ký tự
    expect(generateContent.mock.calls.length).toBeGreaterThanOrEqual(3);
    for (const [arg] of generateContent.mock.calls as unknown as [{ contents: string }][]) {
      expect(Object.keys(JSON.parse(arg.contents)).length).toBeLessThanOrEqual(15);
    }
  });
});

describe('TranslationService tiến trình & huỷ', () => {
  it('báo tiến trình sau mỗi lô, tính cả ô lấy từ cache', async () => {
    const { service } = setup({ apiKey: 'k' });
    await service.translate({ a: 'Câu A' }, 'news-article'); // đưa "Câu A" vào cache
    const events: { done: number; total: number; cached: number; batchesDone: number }[] = [];
    const fields = { a: 'Câu A', ...Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`t${i}`, `Đoạn ${i}`])) };
    await service.translate(fields, 'news-article', { onProgress: (p) => events.push(p) });
    expect(events[0]).toMatchObject({ done: 1, total: 51, cached: 1, batchesDone: 0 });
    expect(events.at(-1)).toMatchObject({ done: 51, total: 51, batchesDone: 4, batchesTotal: 4 }); // 50 ô mới / 15
  });

  it('huỷ giữa chừng -> dừng trước lô kế tiếp', async () => {
    const { service, generateContent } = setup({ apiKey: 'k' });
    const abort = new AbortController();
    abort.abort();
    const fields = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`t${i}`, `Đoạn huỷ ${i}`]));
    await expect(service.translate(fields, 'news-article', { signal: abort.signal })).rejects.toThrow('Đã huỷ dịch');
    expect(generateContent).not.toHaveBeenCalled();
  });
});
