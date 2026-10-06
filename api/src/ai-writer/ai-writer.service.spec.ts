import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import type { AiDraftEvent, AiDraftRequest, AiResearchEvent } from '@remak/shared/contracts/ai-writer';
import { AiWriterAbortedError, AiWriterService } from './ai-writer.service.js';

type JsonReq = { contents: string; parse: (data: unknown) => unknown };

/** GeminiService giả: generateJson trả dữ liệu theo nội dung prompt rồi chạy parse thật của service */
function fakeGemini(respond: (contents: string) => unknown) {
  return {
    generateGrounded: vi.fn(async () => ({
      text: 'Ghi chú nghiên cứu: tấm MGO chịu lửa EI 60 [1].',
      sources: [{ title: 'moc.gov.vn', url: 'https://moc.gov.vn/qcvn06' }],
      searchEntryPointHtml: '<div>gợi ý</div>',
      webSearchQueries: ['tấm mgo'],
    })),
    generateText: vi.fn(async () => 'Ghi chú từ kiến thức model: tấm MGO không cháy [cần kiểm chứng].'),
    generateJson: vi.fn(async (req: JsonReq) => {
      const data = respond(req.contents);
      if (data instanceof Error) throw data;
      return req.parse(data);
    }),
  };
}

function fakeRetriever(facts: { id: string; kind: 'SPEC'; title: string; content: string; sourceUrl: string | null; pinned: boolean }[] = []) {
  return {
    retrieve: vi.fn(async () => ({ mode: 'keyword' as const, facts, articles: [] })),
    factsByIds: vi.fn(async (ids: string[]) => facts.filter((f) => ids.includes(f.id))),
  };
}

function fakePrisma() {
  return {
    newsPostTranslation: {
      findMany: vi.fn(async (args: { where: { status?: string } }) =>
        args.where.status === 'PUBLISHED'
          ? [
              { title: 'Tấm MGO bọc ống gió đạt EI 60', slug: 'tam-mgo-boc-ong-gio', focusKeyword: 'tấm mgo bọc ống gió', publishedAt: new Date() },
              { title: 'Giải mã MGO chảy mồ hôi', slug: 'mgo-chay-mo-hoi', focusKeyword: null, publishedAt: new Date() },
            ]
          : [
              { postId: 'p1', title: 'Tấm MGO bọc ống gió đạt EI 60', slug: 'tam-mgo-boc-ong-gio', status: 'PUBLISHED', focusKeyword: null },
              { postId: 'p2', title: 'Bài khác hẳn', slug: 'bai-khac', status: 'DRAFT', focusKeyword: 'tấm mgo bọc ống gió' },
              { postId: 'p3', title: 'Vách ngăn chống cháy', slug: 'vach-ngan', status: 'DRAFT', focusKeyword: null },
            ],
      ),
    },
    aiKnowledge: {
      findMany: vi.fn(async () => [{ title: 'Tấm MGO dày 12 mm', content: 'Tấm MGO Remak dày 12 mm đạt EI 120' }]),
    },
    newsCategory: {
      findMany: vi.fn(async () => [
        { id: 'c1', translations: [{ name: 'Kỹ thuật' }] },
        { id: 'c2', translations: [{ name: 'Tiêu chuẩn' }] },
      ]),
    },
  };
}

describe('AiWriterService.research', () => {
  it('chạy đủ 3 bước, trả nguồn, gợi ý Google và bài trùng', async () => {
    const gemini = fakeGemini(() => ({
      summary: 'Tóm tắt',
      keyPoints: ['Ý 1', '  ', 'Ý 2'],
      relatedKeywords: ['mgo ống gió'],
      questions: ['Tấm MGO dày bao nhiêu?'],
      fanOutQueries: ['tấm mgo giá'],
    }));
    const service = new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never);
    const events: AiResearchEvent[] = [];
    const r = await service.research({ keyword: 'tấm MGO bọc ống gió' }, { onEvent: (e) => events.push(e) });

    expect(events.map((e) => (e.type === 'stage' ? e.stage : e.type))).toEqual(['knowledge', 'searching', 'structuring', 'checking']);
    expect(r.keyPoints).toEqual(['Ý 1', 'Ý 2']);
    expect(r.sources).toEqual([{ title: 'moc.gov.vn', url: 'https://moc.gov.vn/qcvn06' }]);
    expect(r.searchEntryPointHtml).toBe('<div>gợi ý</div>');
    expect(r.researchText).toContain('EI 60');
    // p2 trùng keyword chính (xếp trước), p1 trùng tiêu đề; p3 không liên quan
    expect(r.duplicates.map((d) => d.id)).toEqual(['p2', 'p1']);
  });

  const structured = () => ({ summary: 'S', keyPoints: ['Ý 1'], relatedKeywords: [], questions: [], fanOutQueries: [] });

  it('Google Search lỗi (hết quota) -> tự chuyển sang model, không nguồn, báo stage fallback', async () => {
    const gemini = fakeGemini(structured);
    gemini.generateGrounded.mockRejectedValueOnce(new BadGatewayException('Dịch vụ AI đang giới hạn lượt gọi'));
    const events: AiResearchEvent[] = [];
    const r = await new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).research({ keyword: 'tấm MGO' }, { onEvent: (e) => events.push(e) });
    expect(events.map((e) => (e.type === 'stage' ? e.stage : e.type))).toEqual(['knowledge', 'searching', 'fallback', 'structuring', 'checking']);
    expect(gemini.generateText).toHaveBeenCalledTimes(1);
    expect(r.grounded).toBe(false);
    expect(r.sources).toEqual([]);
    expect(r.searchEntryPointHtml).toBeNull();
    expect(r.researchText).toMatch(/^\(Ghi chú tổng hợp từ kiến thức của AI/);
  });

  it('có Google Search -> grounded = true, không gọi model dự phòng', async () => {
    const gemini = fakeGemini(structured);
    const r = await new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).research({ keyword: 'tấm MGO' });
    expect(r.grounded).toBe(true);
    expect(gemini.generateText).not.toHaveBeenCalled();
  });

  it('lỗi cấu hình (thiếu/sai key) -> dừng, không chuyển sang model', async () => {
    const gemini = fakeGemini(structured);
    gemini.generateGrounded.mockRejectedValueOnce(new ServiceUnavailableException('Chưa cấu hình AI'));
    await expect(new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).research({ keyword: 'x' })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(gemini.generateText).not.toHaveBeenCalled();
  });

  it('kiến thức nội bộ đưa vào prompt nghiên cứu; trả danh sách kiến thức đã dùng', async () => {
    const gemini = fakeGemini(structured);
    const retriever = fakeRetriever([{ id: 'k1', kind: 'SPEC', title: 'Tấm MGO 12 mm', content: 'Tỷ trọng 963 kg/m³', sourceUrl: '/san-pham/x', pinned: false }]);
    const r = await new AiWriterService(gemini as never, fakePrisma() as never, retriever as never).research({ keyword: 'tấm MGO' });
    const prompt = (gemini.generateGrounded.mock.calls[0] as unknown as [{ prompt: string }])[0].prompt;
    expect(prompt).toContain('KIẾN THỨC NỘI BỘ REMAK');
    expect(prompt).toContain('Tỷ trọng 963 kg/m³');
    expect(r.knowledge).toEqual([{ id: 'k1', kind: 'SPEC', title: 'Tấm MGO 12 mm', pinned: false }]);
    expect(r.retrieval).toBe('keyword');
  });

  it('đề xuất kiến thức mới: chỉ mục có số nguồn hợp lệ, không trùng kho', async () => {
    const gemini = fakeGemini(() => ({
      ...structured(),
      newFacts: [
        { kind: 'MARKET', title: 'QCVN 06 sửa đổi 2025', content: 'Thông tư 09/2025 sửa đổi QCVN 06:2022/BXD.', sourceIndex: 1 },
        { kind: 'SPEC', title: 'Nguồn sai', content: 'Không có nguồn hợp lệ.', sourceIndex: 9 },
        { kind: 'SPEC', title: 'Tấm MGO dày 12 mm', content: 'Tấm MGO Remak dày 12 mm đạt EI 120', sourceIndex: 1 },
      ],
    }));
    const r = await new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).research({ keyword: 'tấm MGO' });
    expect(r.knowledgeSuggestions).toEqual([
      { kind: 'MARKET', title: 'QCVN 06 sửa đổi 2025', content: 'Thông tư 09/2025 sửa đổi QCVN 06:2022/BXD.', sourceUrl: 'https://moc.gov.vn/qcvn06', sourceTitle: 'moc.gov.vn' },
    ]);
  });

  it('chế độ chỉ dùng model -> không đề xuất kiến thức', async () => {
    const gemini = fakeGemini(() => ({ ...structured(), newFacts: [{ kind: 'MARKET', title: 'X', content: 'Y', sourceIndex: 1 }] }));
    gemini.generateGrounded.mockRejectedValueOnce(new BadGatewayException('quota'));
    const r = await new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).research({ keyword: 'tấm MGO' });
    expect(r.knowledgeSuggestions).toEqual([]);
  });

  it('kết quả cấu trúc thiếu ý chính -> lỗi định dạng (để GeminiService thử lại)', async () => {
    const gemini = fakeGemini(() => ({ summary: '', keyPoints: [], relatedKeywords: [], questions: [], fanOutQueries: [] }));
    const service = new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never);
    await expect(service.research({ keyword: 'x' })).rejects.toThrow('Thiếu ý chính');
  });
});

describe('AiWriterService.outline', () => {
  const req = { keyword: 'tấm MGO', length: 'medium' as const, keyPoints: [], questions: [], researchText: 'r', sources: [] };

  it('chuẩn hoá slug, chỉ nhận chuyên mục có thật, mục đầu luôn là H2', async () => {
    const gemini = fakeGemini(() => ({
      titleOptions: ['Tấm MGO là gì? Thông số và ứng dụng', 'B', 'C', 'D'],
      slug: 'Tấm MGO là gì!',
      sapo: 'Sapo',
      categoryId: 'khong-ton-tai',
      seoTitle: 'SEO',
      seoDescription: 'Mô tả',
      coverAlt: 'Ảnh',
      sections: [
        { level: 3, heading: 'Tấm MGO là gì?', points: ['định nghĩa'] },
        { level: 3, heading: 'Thông số', points: [] },
        { level: 2, heading: '  ', points: [] },
      ],
      faq: [{ question: 'Giá bao nhiêu?' }, { question: '' }],
    }));
    const o = await new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).outline(req);
    expect(o.titleOptions).toHaveLength(3);
    expect(o.slug).toBe('tam-mgo-la-gi');
    expect(o.categoryId).toBeNull();
    expect(o.sections.map((s) => s.level)).toEqual([2, 3]);
    expect(o.faq).toEqual([{ question: 'Giá bao nhiêu?' }]);
  });

  it('chuyên mục hợp lệ được giữ', async () => {
    const gemini = fakeGemini(() => ({
      titleOptions: ['T'],
      slug: '',
      sapo: '',
      categoryId: 'c2',
      seoTitle: '',
      seoDescription: '',
      coverAlt: '',
      sections: [
        { level: 2, heading: 'A', points: [] },
        { level: 2, heading: 'B', points: [] },
      ],
      faq: [],
    }));
    const o = await new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never).outline(req);
    expect(o.categoryId).toBe('c2');
    expect(o.slug).toBe('t');
  });
});

describe('AiWriterService.draft', () => {
  const req: AiDraftRequest = {
    keyword: 'tấm MGO bọc ống gió',
    length: 'short',
    title: 'Tấm MGO bọc ống gió',
    sapo: 'Sapo',
    sections: [
      { level: 2, heading: 'Tấm MGO bọc ống gió là gì?', points: ['định nghĩa'] },
      { level: 2, heading: 'Thi công như thế nào?', points: ['các bước'] },
    ],
    faq: [{ question: 'Dày bao nhiêu?' }],
    researchText: 'r',
    sources: [{ title: 'QCVN 06', url: 'https://moc.gov.vn/qcvn06' }],
  };

  const respond = (contents: string) => {
    if (contents.includes('hộp "Tóm tắt nhanh"')) return { items: ['Ý 1', '  ', 'Ý 2'] };
    if (contents.includes('câu hỏi FAQ')) return { items: [{ question: 'Dày bao nhiêu?', answer: 'Dày 12 mm theo <a href="https://moc.gov.vn/qcvn06">QCVN</a>.' }] };
    if (contents.includes('NHIỆM VỤ: viết nội dung cho mục H2 "Tấm MGO bọc ống gió là gì?"')) {
      return {
        blocks: [
          { type: 'paragraph', text: 'Xem <a href="/san-pham">sản phẩm</a> và <a href="/tin-tuc/tam-mgo-boc-ong-gio">bài này</a>, không phải <a href="https://evil.com">đây</a>.' },
          { type: 'heading', level: 2, text: 'Mục con' },
        ],
      };
    }
    return { blocks: [{ type: 'numbered', items: ['Đo', `Cắt ${'[cần kiểm chứng]'}`] }] };
  };

  async function run(r: (c: string) => unknown, signal?: AbortSignal) {
    const service = new AiWriterService(fakeGemini(r) as never, fakePrisma() as never, fakeRetriever() as never);
    const events: AiDraftEvent[] = [];
    await service.draft(req, { onEvent: (e) => events.push(e), signal });
    return events;
  }

  it('thứ tự sự kiện: start đầu, references rồi result cuối; đủ summary, 2 mục, faq', async () => {
    const events = await run(respond);
    const types = events.map((e) => e.type);
    expect(types[0]).toBe('start');
    expect(types.slice(-2)).toEqual(['references', 'result']);
    // Mục có thể được gửi lại sau vòng tự sửa — đủ cả 2 index
    expect(new Set(events.flatMap((e) => (e.type === 'section' ? [e.index] : []))).size).toBe(2);
    expect(types).toContain('quality');
    expect(types).toContain('summary');
    expect(types).toContain('faq');
  });

  it('mục có tiêu đề từ dàn ý, tiêu đề con bị hạ cấp, link lạ bị bỏ', async () => {
    const events = await run(respond);
    const s0 = events.find((e) => e.type === 'section' && e.index === 0) as Extract<AiDraftEvent, { type: 'section' }>;
    expect(s0.nodes[0]).toEqual({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Tấm MGO bọc ống gió là gì?' }] });
    expect(s0.nodes[2]).toMatchObject({ type: 'heading', attrs: { level: 3 } });
    expect(JSON.stringify(s0.nodes)).not.toContain('evil.com');
  });

  it('hộp tóm tắt luôn là variant summary; FAQ dùng câu hỏi của dàn ý', async () => {
    const events = await run(respond);
    const summary = events.find((e) => e.type === 'summary') as Extract<AiDraftEvent, { type: 'summary' }>;
    expect(summary.nodes[0]).toMatchObject({ type: 'callout', attrs: { variant: 'summary' } });
    const faq = events.find((e) => e.type === 'faq') as Extract<AiDraftEvent, { type: 'faq' }>;
    expect(faq.nodes[0].content![0]).toMatchObject({ type: 'faqItem', attrs: { question: 'Dày bao nhiêu?' } });
  });

  it('hộp tóm tắt là danh sách ý (bỏ ý rỗng); tóm tắt rỗng -> cảnh báo', async () => {
    const events = await run(respond);
    const summary = events.find((e) => e.type === 'summary') as Extract<AiDraftEvent, { type: 'summary' }>;
    expect(summary.nodes[0].content![0]).toMatchObject({ type: 'bulletList' });
    expect(summary.nodes[0].content![0].content).toHaveLength(2);
    const empty = await run((c) => (c.includes('hộp "Tóm tắt nhanh"') ? { items: [] } : respond(c)));
    expect(empty.some((e) => e.type === 'summary')).toBe(false);
    expect((empty.at(-1) as Extract<AiDraftEvent, { type: 'result' }>).warnings.some((w) => w.includes('Tóm tắt nhanh'))).toBe(true);
  });

  it('result: gợi ý link nội bộ (không gồm link nguồn ngoài) + cảnh báo [cần kiểm chứng]', async () => {
    const events = await run(respond);
    const result = events.at(-1) as Extract<AiDraftEvent, { type: 'result' }>;
    expect(result.linkSuggestions).toEqual([
      { href: '/san-pham', anchorText: 'sản phẩm', sectionIndex: 0, title: 'Sản phẩm tấm MGO FireOFF' },
      { href: '/tin-tuc/tam-mgo-boc-ong-gio', anchorText: 'bài này', sectionIndex: 0, title: 'Tấm MGO bọc ống gió đạt EI 60' },
    ]);
    expect(result.warnings[0]).toContain('[cần kiểm chứng]');
  });

  it('references là danh sách link nguồn', async () => {
    const events = await run(respond);
    const refs = events.find((e) => e.type === 'references') as Extract<AiDraftEvent, { type: 'references' }>;
    expect(refs.nodes[0]).toMatchObject({ type: 'heading', attrs: { level: 2 } });
    expect(JSON.stringify(refs.nodes[1])).toContain('https://moc.gov.vn/qcvn06');
  });

  it('kiến thức đã chọn: vào prompt viết; trang sản phẩm của kiến thức được phép đặt link', async () => {
    const retriever = fakeRetriever([{ id: 'k1', kind: 'SPEC', title: 'Tấm MGO DuctBoard', content: 'Dày 8 mm, EI 60', sourceUrl: '/san-pham/ductboard', pinned: false }]);
    const gemini = fakeGemini((c) =>
      c.includes('NHIỆM VỤ: viết nội dung cho mục H2 "Tấm MGO bọc ống gió là gì?"')
        ? { blocks: [{ type: 'paragraph', text: 'Dùng <a href="/san-pham/ductboard">DuctBoard</a> dày 8 mm.' }] }
        : respond(c),
    );
    const service = new AiWriterService(gemini as never, fakePrisma() as never, retriever as never);
    const events: AiDraftEvent[] = [];
    await service.draft({ ...req, knowledgeIds: ['k1'] }, { onEvent: (e) => events.push(e) });
    const prompts = (gemini.generateJson.mock.calls as unknown as [{ contents: string }][]).map((c) => c[0].contents);
    expect(prompts.every((p) => p.includes('Dày 8 mm, EI 60'))).toBe(true);
    const result = events.at(-1) as Extract<AiDraftEvent, { type: 'result' }>;
    expect(result.linkSuggestions.map((l) => l.href)).toContain('/san-pham/ductboard');
  });

  it('tự sửa: mục mở đầu bằng danh sách -> AI viết lại mở đầu bằng câu trả lời, điểm không giảm', async () => {
    const opening = 'Tấm MGO bọc ống gió là tấm magie oxit dùng bọc ngoài ống gió để đạt giới hạn chịu lửa theo QCVN 06:2022/BXD, giúp hệ thống thông gió giữ kín khói và cách nhiệt khi có cháy trong thời gian quy định.';
    const r = (c: string) => {
      if (c.includes('YÊU CẦU SỬA')) return { blocks: [{ type: 'paragraph', text: opening }, { type: 'bullets', items: ['Đo', 'Cắt'] }] };
      if (c.includes('NHIỆM VỤ: viết nội dung')) return { blocks: [{ type: 'bullets', items: ['Đo', 'Cắt'] }] };
      return respond(c);
    };
    const events = await run(r);
    const quality = events.find((e) => e.type === 'quality') as Extract<AiDraftEvent, { type: 'quality' }>;
    expect(quality.fixes.some((f) => f.includes('mở đầu bằng câu trả lời trực tiếp'))).toBe(true);
    expect(quality.after.aeo).toBeGreaterThanOrEqual(quality.before.aeo);
    const resent = events.filter((e) => e.type === 'section' && e.index === 0) as Extract<AiDraftEvent, { type: 'section' }>[];
    expect(resent.length).toBe(2);
    expect(JSON.stringify(resent[1].nodes)).toContain('magie oxit');
    // quality gửi trước references / result
    const types = events.map((e) => e.type);
    expect(types.indexOf('quality')).toBeLessThan(types.indexOf('result'));
  });

  it('tự sửa làm điểm giảm -> giữ bản gốc, không gửi lại mục', async () => {
    // Bản nháp tốt (mở đầu trả lời thẳng, có số liệu, có danh sách) nhưng thiếu câu định nghĩa -> có kế hoạch sửa;
    // bản sửa của AI lại cụt lủn, mất số liệu và danh sách -> điểm giảm -> bỏ
    const good = `Thi công bọc ống gió cần tấm dày 12 mm, khoảng cách vít 200 mm và keo chống cháy ở mối nối để hệ đạt giới hạn chịu lửa EI 60 theo QCVN 06:2022/BXD, đúng như mẫu đã thử nghiệm tại viện IBST.`;
    const r = (c: string) => {
      if (c.includes('YÊU CẦU SỬA')) return { blocks: [{ type: 'paragraph', text: 'Ngắn.' }] };
      if (c.includes('NHIỆM VỤ: viết nội dung')) return { blocks: [{ type: 'paragraph', text: good }, { type: 'numbered', items: ['Đo 2 m', 'Cắt 12 mm'] }] };
      return respond(c);
    };
    const events = await run(r);
    const quality = events.find((e) => e.type === 'quality') as Extract<AiDraftEvent, { type: 'quality' }>;
    expect(quality.fixes).toEqual([]);
    expect(quality.after).toEqual(quality.before);
    expect(events.filter((e) => e.type === 'section')).toHaveLength(2);
  });

  it('một mục lỗi -> đoạn giữ chỗ + cảnh báo, bài vẫn xong', async () => {
    const events = await run((c) => (c.includes('"Thi công như thế nào?" (đánh dấu') ? new BadGatewayException('quá tải') : respond(c)));
    const s1 = events.find((e) => e.type === 'section' && e.index === 1) as Extract<AiDraftEvent, { type: 'section' }>;
    expect(JSON.stringify(s1.nodes)).toContain('chưa viết được');
    const result = events.at(-1) as Extract<AiDraftEvent, { type: 'result' }>;
    expect(result.warnings.some((w) => w.includes('Thi công như thế nào?'))).toBe(true);
  });

  it('mọi mục đều lỗi -> báo lỗi quá tải', async () => {
    await expect(run((c) => (c.includes('NHIỆM VỤ: viết nội dung') ? new BadGatewayException('x') : respond(c)))).rejects.toThrow(
      'chưa viết được mục nào',
    );
  });

  it('huỷ giữa chừng -> AiWriterAbortedError, không có result', async () => {
    const abort = new AbortController();
    const events: AiDraftEvent[] = [];
    const gemini = fakeGemini((c) => {
      abort.abort();
      return respond(c);
    });
    const service = new AiWriterService(gemini as never, fakePrisma() as never, fakeRetriever() as never);
    await expect(service.draft(req, { onEvent: (e) => events.push(e), signal: abort.signal })).rejects.toBeInstanceOf(AiWriterAbortedError);
    expect(events.some((e) => e.type === 'result')).toBe(false);
  });
});
