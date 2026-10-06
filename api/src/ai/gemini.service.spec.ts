import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { GeminiService, InvalidAiOutputError } from './gemini.service.js';

function setup(generateContent?: ReturnType<typeof vi.fn>) {
  const config = { get: (key: string, fallback?: unknown) => (key === 'translation.geminiApiKey' ? 'k' : fallback) };
  const gemini = new GeminiService(config as never);
  gemini.onModuleInit();
  if (generateContent) (gemini as unknown as { client: unknown }).client = { models: { generateContent } };
  return gemini;
}

describe('GeminiService.generateGrounded', () => {
  it('trả văn bản, nguồn web (bỏ trùng), HTML gợi ý tìm kiếm và truy vấn fan-out; gửi kèm tool googleSearch', async () => {
    const generateContent = vi.fn(async () => ({
      text: '  Tóm tắt nghiên cứu  ',
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: 'https://a.vn/1', title: 'a.vn' } },
              { web: { uri: 'https://a.vn/1', title: 'a.vn' } },
              { web: { uri: 'https://b.gov.vn/2', domain: 'b.gov.vn' } },
              { retrievedContext: {} },
            ],
            searchEntryPoint: { renderedContent: '<div>chips</div>' },
            webSearchQueries: ['tấm mgo là gì', 'mgo chống cháy'],
          },
        },
      ],
    }));
    const r = await setup(generateContent).generateGrounded({ system: 's', prompt: 'p' });
    expect(r).toEqual({
      text: 'Tóm tắt nghiên cứu',
      sources: [
        { title: 'a.vn', url: 'https://a.vn/1' },
        { title: 'b.gov.vn', url: 'https://b.gov.vn/2' },
      ],
      searchEntryPointHtml: '<div>chips</div>',
      webSearchQueries: ['tấm mgo là gì', 'mgo chống cháy'],
    });
    const call = (generateContent.mock.calls[0] as unknown as [{ config: { tools: unknown } }])[0];
    expect(call.config.tools).toEqual([{ googleSearch: {} }]);
  });
});

describe('GeminiService.generateJson', () => {
  it('kết quả sai định dạng -> thử lại, thành công ở lần sau', async () => {
    const generateContent = vi
      .fn()
      .mockResolvedValueOnce({ text: 'không phải json' })
      .mockResolvedValueOnce({ text: '{"a":"ok"}' });
    const r = await setup(generateContent).generateJson({
      system: 's',
      contents: 'c',
      schema: {},
      parse: (d) => {
        const v = (d as { a?: string }).a;
        if (!v) throw new InvalidAiOutputError('thiếu a');
        return v;
      },
    });
    expect(r).toBe('ok');
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('sai định dạng mọi lần -> 502 "không hợp lệ"', async () => {
    const generateContent = vi.fn(async () => ({ text: '{}' }));
    await expect(
      setup(generateContent).generateJson({
        system: 's',
        contents: 'c',
        schema: {},
        parse: () => {
          throw new InvalidAiOutputError('x');
        },
      }),
    ).rejects.toThrow(BadGatewayException);
  });

  it('chưa cấu hình key -> 503', async () => {
    const config = { get: (_k: string, fallback?: unknown) => fallback };
    const gemini = new GeminiService(config as never);
    gemini.onModuleInit();
    await expect(gemini.generateJson({ system: 's', contents: 'c', schema: {}, parse: (d) => d })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('đã huỷ (signal) -> không gọi Gemini', async () => {
    const generateContent = vi.fn();
    const abort = new AbortController();
    abort.abort();
    await expect(
      setup(generateContent).generateJson({ system: 's', contents: 'c', schema: {}, parse: (d) => d }, { signal: abort.signal }),
    ).rejects.toBeDefined();
    expect(generateContent).not.toHaveBeenCalled();
  });
});
