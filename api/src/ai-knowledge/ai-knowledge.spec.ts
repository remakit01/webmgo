import { AiIndexService } from './ai-index.service.js';
import { AiKnowledgeService } from './ai-knowledge.service.js';
import { AiRetrieverService } from './ai-retriever.service.js';
import { SOURCE_KNOWLEDGE, knowledgeChunks, textHash } from './ai-knowledge.text.js';

const K = (id: string, title: string, content: string, extra: Partial<{ pinned: boolean; tags: string[] }> = {}) => ({
  id,
  kind: 'SPEC' as const,
  title,
  content,
  tags: extra.tags ?? [],
  sourceUrl: '/san-pham',
  pinned: extra.pinned ?? false,
});

const KNOWLEDGE = [
  K('company', 'Remak hồ sơ', 'Remak sản xuất tấm MGO FireOFF', { pinned: true }),
  K('duct', 'Tấm MGO bọc ống gió 8mm', 'Bọc ống gió hút khói đạt EI 60, dày 8 mm, tỷ trọng 963 kg/m³'),
  K('floor', 'Tấm MGO lót sàn 18mm', 'Lót sàn chịu tải trên 800 kg/m², dày 18 mm'),
  K('price', 'Bảng giá', 'Giá tham khảo theo độ dày'),
];
const NEWS = [
  { postId: 'p1', title: 'Nghiệm thu ống gió', slug: 'nghiem-thu-ong-gio', sapo: 'Sapo', contentText: 'Ống gió phải đạt giới hạn chịu lửa EI theo QCVN 06.' },
  { postId: 'p2', title: 'Bảo quản kho', slug: 'bao-quan', sapo: 'Sapo', contentText: 'Hướng dẫn xếp kho.' },
];

function prismaMock(embeddings: { sourceType: string; sourceId: string; chunk: number; vector: number[]; textHash?: string }[] = []) {
  return {
    aiKnowledge: { findMany: vi.fn(async () => KNOWLEDGE) },
    newsPostTranslation: { findMany: vi.fn(async () => NEWS) },
    aiEmbedding: { findMany: vi.fn(async () => embeddings) },
  };
}

const geminiMock = (embed?: (texts: string[]) => number[][] | Promise<number[][]>) => ({
  client: {},
  embeddingModel: 'emb-test',
  embed: vi.fn(async (texts: string[]) => {
    if (!embed) throw new Error('quota');
    return embed(texts);
  }),
});

describe('AiRetrieverService', () => {
  it('chế độ từ khoá: ghim luôn có, kiến thức khớp keyword lên đầu, bài cũ liên quan', async () => {
    const retriever = new AiRetrieverService(prismaMock() as never, geminiMock() as never);
    const r = await retriever.retrieve({ keyword: 'tấm MGO bọc ống gió' });
    expect(r.mode).toBe('keyword');
    expect(r.facts[0].id).toBe('company');
    expect(r.facts[1].id).toBe('duct');
    expect(r.facts.map((f) => f.id)).not.toContain('price');
    expect(r.articles[0].slug).toBe('nghiem-thu-ong-gio');
  });

  it('embedding lỗi (hết quota) -> vẫn trả kết quả theo từ khoá', async () => {
    const prisma = prismaMock([{ sourceType: SOURCE_KNOWLEDGE, sourceId: 'floor', chunk: 0, vector: [1, 0] }]);
    const r = await new AiRetrieverService(prisma as never, geminiMock() as never).retrieve({ keyword: 'ống gió' });
    expect(r.mode).toBe('keyword');
    expect(r.facts.some((f) => f.id === 'duct')).toBe(true);
  });

  it('hybrid: kiến thức gần nghĩa (không trùng từ khoá) vẫn được tìm thấy', async () => {
    const prisma = prismaMock([
      { sourceType: SOURCE_KNOWLEDGE, sourceId: 'floor', chunk: 0, vector: [1, 0] },
      { sourceType: SOURCE_KNOWLEDGE, sourceId: 'price', chunk: 0, vector: [0, 1] },
    ]);
    const r = await new AiRetrieverService(prisma as never, geminiMock(() => [[1, 0.05]]) as never).retrieve({ keyword: 'sàn nâng data center' });
    expect(r.mode).toBe('hybrid');
    expect(r.facts.map((f) => f.id)).toContain('floor');
    // Vector xa (cosine thấp) không bị kéo vào
    expect(r.facts.map((f) => f.id)).not.toContain('price');
  });

  it('giới hạn số mẩu và ngân sách ký tự', async () => {
    const retriever = new AiRetrieverService(prismaMock() as never, geminiMock() as never);
    const r = await retriever.retrieve({ keyword: 'tấm MGO dày mm' }, { factLimit: 2 });
    expect(r.facts).toHaveLength(2);
    const tiny = await retriever.retrieve({ keyword: 'tấm MGO dày mm' }, { charBudget: 10 });
    expect(tiny.facts).toHaveLength(1); // luôn giữ ít nhất mẩu đầu tiên
  });
});

describe('AiIndexService.sync', () => {
  const k = { id: 'duct', title: 'Tấm MGO', content: 'Bọc ống gió', tags: [] as string[] };
  const chunk0 = knowledgeChunks(k)[0];

  function setup(existing: { sourceType: string; sourceId: string; chunk: number; textHash: string }[], embed?: () => number[][]) {
    const prisma = {
      aiKnowledge: { findMany: vi.fn(async () => [k]) },
      newsPostTranslation: { findMany: vi.fn(async () => []) },
      aiEmbedding: {
        findMany: vi.fn(async () => existing),
        upsert: vi.fn((args: unknown) => args),
        deleteMany: vi.fn((args: unknown) => args),
      },
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    };
    const gemini = geminiMock(embed);
    return { prisma, gemini, service: new AiIndexService(prisma as never, gemini as never) };
  }

  it('đoạn không đổi hash -> không gọi embedding; vector mồ côi bị xoá', async () => {
    const { service, gemini, prisma } = setup([
      { sourceType: SOURCE_KNOWLEDGE, sourceId: 'duct', chunk: 0, textHash: textHash(chunk0) },
      { sourceType: SOURCE_KNOWLEDGE, sourceId: 'old', chunk: 0, textHash: 'x' },
    ]);
    const r = await service.sync();
    expect(gemini.embed).not.toHaveBeenCalled();
    expect(r).toEqual({ embedded: 0, skipped: 1, removed: 1, failed: 0 });
    expect(prisma.aiEmbedding.deleteMany).toHaveBeenCalledWith({ where: { model: 'emb-test', sourceType: SOURCE_KNOWLEDGE, sourceId: 'old', chunk: { in: [0] } } });
  });

  it('đoạn mới / đổi nội dung -> nhúng và upsert', async () => {
    const { service, prisma } = setup([], () => [[0.1, 0.2]]);
    const r = await service.sync();
    expect(r.embedded).toBe(1);
    expect(prisma.aiEmbedding.upsert).toHaveBeenCalledTimes(1);
  });

  it('embedding lỗi -> đếm failed, không ném lỗi', async () => {
    const { service } = setup([]);
    await expect(service.sync()).resolves.toMatchObject({ embedded: 0, failed: 1 });
  });
});

describe('AiKnowledgeService.acceptSuggestions', () => {
  it('bỏ mẩu trùng kho và trùng nhau, lưu origin AI_WEB', async () => {
    const created: unknown[] = [];
    const prisma = {
      aiKnowledge: {
        findMany: vi.fn(async () => [{ title: 'Tấm MGO dày 12 mm', content: 'Tấm MGO dày 12 mm đạt EI 120' }]),
        create: vi.fn((args: { data: Record<string, unknown> }) => {
          const row = { id: `n${created.length}`, tags: [], status: 'ACTIVE', pinned: false, sourceTitle: null, verifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ...args.data };
          created.push(row);
          return row;
        }),
      },
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    };
    const index = { syncKnowledgeLater: vi.fn() };
    const service = new AiKnowledgeService(prisma as never, index as never, { embeddingModel: 'x' } as never);
    const item = (title: string, content: string) => ({ kind: 'MARKET' as const, title, content, sourceUrl: 'https://moc.gov.vn/a', sourceTitle: 'Bộ Xây dựng' });
    const r = await service.acceptSuggestions(
      [
        item('Tấm MGO dày 12 mm', 'Tấm MGO dày 12 mm đạt EI 120'), // trùng kho
        item('QCVN 06:2022 sửa đổi 2025', 'Thông tư sửa đổi QCVN 06 có hiệu lực từ 2025'),
        item('QCVN 06:2022 sửa đổi 2025', 'Thông tư sửa đổi QCVN 06 có hiệu lực từ 2025'), // trùng nhau
      ],
      'u1',
    );
    expect(r.skipped).toBe(2);
    expect(r.created).toHaveLength(1);
    expect(r.created[0].origin).toBe('AI_WEB');
    expect(index.syncKnowledgeLater).toHaveBeenCalledWith(['n0']);
  });
});
