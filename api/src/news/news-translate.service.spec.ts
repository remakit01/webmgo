import { BadRequestException } from '@nestjs/common';
import { validateRichDoc } from '@remak/shared/rich-content';
import { NewsTranslateService } from './news-translate.service.js';

const CONTENT_UPDATED = new Date('2026-10-05T02:00:00Z');

const viTranslation = (over: Record<string, unknown> = {}) => ({
  locale: 'vi',
  title: 'Tôi là ABC',
  slug: 'toi-la-abc',
  sapo: 'Sapo tiếng Việt',
  coverAlt: 'Ảnh bìa',
  coverCaption: null,
  seoTitle: null,
  seoDescription: null,
  sourceName: 'Báo Xây Dựng',
  sourceUrl: 'https://baoxaydung.vn/a',
  noindex: false,
  contentUpdatedAt: CONTENT_UPDATED,
  content: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Tấm ' }, { type: 'text', text: 'MGO', marks: [{ type: 'bold' }] }] },
      { type: 'image', attrs: { src: 'http://x/news/content/a/1.webp', alt: 'Ảnh', caption: null } },
    ],
  },
  ...over,
});

function setup(translations: Record<string, unknown>[], slugTaken: string[] = []) {
  const prisma = {
    newsPost: { findFirst: vi.fn(async () => ({ id: 'p1', translations })) },
    newsPostTranslation: { count: vi.fn(async ({ where }: { where: { slug: string } }) => (slugTaken.includes(where.slug) ? 1 : 0)) },
  };
  // Giả lập Gemini: tiền tố [EN] cho mọi ô, giữ nguyên thẻ
  const translation = {
    translate: vi.fn(async (fields: Record<string, string>) =>
      Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, k === 'title' ? 'I am ABC' : v.replace('Tấm ', 'Board ').replace('Ảnh', 'Photo')])),
    ),
  };
  return { service: new NewsTranslateService(prisma as never, translation as never), translation };
}

describe('NewsTranslateService.aiDraft', () => {
  it('dịch tiêu đề/sapo/nội dung, giữ định dạng và ảnh, slug sinh từ tiêu đề tiếng Anh', async () => {
    const { service, translation } = setup([viTranslation()]);
    const draft = await service.aiDraft('p1');

    const sent = translation.translate.mock.calls[0] as unknown as [Record<string, string>, string];
    expect(sent[1]).toBe('news-article');
    expect(sent[0]).toMatchObject({ title: 'Tôi là ABC', sapo: 'Sapo tiếng Việt', 'c.t0': 'Tấm <b>MGO</b>', 'c.alt0': 'Ảnh' });
    expect(sent[0]).not.toHaveProperty('sourceName');

    expect(draft.slug).toBe('i-am-abc');
    expect(draft.origin).toBe('AI');
    expect(draft.sourceUpdatedAt).toBe(CONTENT_UPDATED.toISOString());
    expect(draft.sourceName).toBe('Báo Xây Dựng');
    expect(draft.content.content[0].content).toEqual([
      { type: 'text', text: 'Board ' },
      { type: 'text', text: 'MGO', marks: [{ type: 'bold' }] },
    ]);
    expect(draft.content.content[1].attrs?.alt).toBe('Photo');
    expect(validateRichDoc(draft.content).ok).toBe(true);
    expect(draft.fallbackBlocks).toBe(0);
  });

  it('phát sự kiện prepare -> assemble theo thứ tự (CMS hiện tiến trình)', async () => {
    const { service } = setup([viTranslation()]);
    const types: string[] = [];
    let prepare: Record<string, unknown> | undefined;
    await service.aiDraft('p1', {
      onEvent: (e) => {
        types.push(e.type);
        if (e.type === 'prepare') prepare = e;
      },
    });
    expect(types[0]).toBe('prepare');
    expect(types.at(-1)).toBe('assemble');
    expect(prepare).toMatchObject({ blocks: 1, images: 1 });
  });

  it('AI tự chèn markdown ** vào tiêu đề/nội dung -> bỏ đi khi bản gốc không có', async () => {
    const { service, translation } = setup([viTranslation()]);
    translation.translate.mockImplementationOnce(async (fields: Record<string, string>) =>
      Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, k === 'title' ? '**Combined** Solutions' : `**${v}**`])),
    );
    const draft = await service.aiDraft('p1');
    expect(draft.title).toBe('Combined Solutions');
    expect(draft.sapo).toBe('Sapo tiếng Việt');
    expect(JSON.stringify(draft.content)).not.toContain('**');
  });

  it('đã có bản tiếng Anh thì giữ đường dẫn tiếng Anh cũ', async () => {
    const { service } = setup([viTranslation(), { ...viTranslation(), locale: 'en', slug: 'old-english-slug' }]);
    expect((await service.aiDraft('p1')).slug).toBe('old-english-slug');
  });

  it('slug tiếng Anh trùng bài khác -> thêm hậu tố', async () => {
    const { service } = setup([viTranslation()], ['i-am-abc']);
    expect((await service.aiDraft('p1')).slug).toBe('i-am-abc-2');
  });

  it('bài quá dài -> 400, không gọi Gemini', async () => {
    const { service, translation } = setup([viTranslation({ sapo: 'x'.repeat(70_000) })]);
    await expect(service.aiDraft('p1')).rejects.toBeInstanceOf(BadRequestException);
    expect(translation.translate).not.toHaveBeenCalled();
  });
});
