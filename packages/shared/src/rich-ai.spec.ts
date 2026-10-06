import { aiBlocksToRichNodes, aiBlocksToValidNodes, readAiBlocks, type AiBlock } from './rich-ai.js';
import { validateRichDoc } from './rich-content.js';

const ALLOWED = new Set(['/san-pham', 'https://moc.gov.vn/qcvn06']);
const opts = { allowHref: (h: string) => ALLOWED.has(h), minHeadingLevel: 3 };

describe('readAiBlocks', () => {
  it('đọc đúng cấu trúc', () => {
    expect(readAiBlocks({ blocks: [{ type: 'paragraph', text: 'x' }] })).toEqual([{ type: 'paragraph', text: 'x' }]);
  });
  it('sai cấu trúc -> null', () => {
    expect(readAiBlocks({})).toBeNull();
    expect(readAiBlocks({ blocks: [{ type: 'image', text: 'x' }] })).toBeNull();
    expect(readAiBlocks({ blocks: [{ type: 'bullets', items: [1, 2] }] })).toBeNull();
  });
});

describe('aiBlocksToRichNodes', () => {
  const blocks: AiBlock[] = [
    { type: 'heading', level: 2, text: 'Tấm MGO là gì?' },
    { type: 'paragraph', text: 'Đoạn <b>một</b> có <a href="/san-pham">sản phẩm</a>.\n\nĐoạn hai có <a href="https://evil.com">link lạ</a>.' },
    { type: 'bullets', items: ['Ý 1', '', 'Ý <i>2</i>'] },
    { type: 'numbered', items: ['Bước 1', 'Bước 2'] },
    { type: 'quote', text: 'Theo <a href="https://moc.gov.vn/qcvn06">QCVN 06</a>' },
    { type: 'callout', variant: 'summary', items: ['Chịu lửa EI 60', 'Không amiăng'] },
    { type: 'callout', variant: 'lạ', text: 'Lưu ý' },
    { type: 'table', rows: [['Tiêu chí', 'MGO', 'Thạch cao'], ['Chịu ẩm', 'Tốt'], ['', '']] },
    { type: 'paragraph', text: '   ' },
  ];
  const { nodes, links } = aiBlocksToRichNodes(blocks, opts);

  it('kết quả luôn qua validateRichDoc', () => {
    expect(validateRichDoc({ type: 'doc', content: nodes })).toEqual({ ok: true });
  });
  it('tiêu đề bị kẹp về cấp nhỏ nhất cho phép (H2 -> H3)', () => {
    expect(nodes[0]).toMatchObject({ type: 'heading', attrs: { level: 3 } });
  });
  it('tách đoạn theo dòng trống; bỏ link ngoài whitelist, giữ chữ', () => {
    expect(nodes[1].type).toBe('paragraph');
    expect(nodes[2].type).toBe('paragraph');
    const lastText = nodes[2].content!.map((n) => n.text).join('');
    expect(lastText).toBe('Đoạn hai có link lạ.');
    expect(JSON.stringify(nodes[2])).not.toContain('evil.com');
  });
  it('ghi nhận link được giữ', () => {
    expect(links).toEqual([
      { href: '/san-pham', text: 'sản phẩm' },
      { href: 'https://moc.gov.vn/qcvn06', text: 'QCVN 06' },
    ]);
  });
  it('danh sách bỏ mục rỗng; callout summary dạng danh sách; variant lạ -> info', () => {
    expect(nodes[3].content).toHaveLength(2);
    expect(nodes[4].type).toBe('orderedList');
    expect(nodes[6]).toMatchObject({ type: 'callout', attrs: { variant: 'summary' } });
    expect(nodes[6].content![0].type).toBe('bulletList');
    expect(nodes[7]).toMatchObject({ type: 'callout', attrs: { variant: 'info' } });
  });
  it('bảng: hàng đầu là tiêu đề, đệm đủ cột, bỏ hàng rỗng', () => {
    const t = nodes[8];
    expect(t.type).toBe('table');
    expect(t.content).toHaveLength(2);
    expect(t.content![0].content![0].type).toBe('tableHeader');
    expect(t.content![1].content).toHaveLength(3);
  });
  it('khối rỗng bị bỏ', () => {
    expect(nodes).toHaveLength(9);
  });
  it('thẻ hỏng -> chữ thuần', () => {
    const r = aiBlocksToRichNodes([{ type: 'paragraph', text: 'Lỗi <b>thẻ' }], opts);
    expect(r.nodes[0].content).toEqual([{ type: 'text', text: 'Lỗi thẻ' }]);
  });
});

describe('aiBlocksToValidNodes', () => {
  it('trả ok kèm nodes', () => {
    const r = aiBlocksToValidNodes([{ type: 'paragraph', text: 'Xin chào' }], opts);
    expect(r.ok).toBe(true);
  });
});
