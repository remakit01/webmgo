import { parseInline, plainInline, serializeInline } from './rich-inline.js';
import { collectFaqItems, toPlainText, validateRichDoc, type RichDoc } from './rich-content.js';
import { applySegments, collectSegments } from './rich-translate.js';

describe('parseInline — chế độ <a href> (AI viết bài)', () => {
  const allowHref = (href: string) => ['/san-pham', '/tin-tuc/tam-mgo'].includes(href);

  it('giữ link trong whitelist, bỏ link lạ nhưng giữ chữ', () => {
    expect(parseInline('Xem <a href="/san-pham">sản phẩm</a> và <a href="https://evil.com">đây</a>.', { allowHref })).toEqual([
      { type: 'text', text: 'Xem ' },
      { type: 'text', text: 'sản phẩm', marks: [{ type: 'link', attrs: { href: '/san-pham' } }] },
      { type: 'text', text: ' và đây.' },
    ]);
  });

  it('link lồng định dạng', () => {
    expect(parseInline('<b><a href="/tin-tuc/tam-mgo">MGO</a></b>', { allowHref })).toEqual([
      { type: 'text', text: 'MGO', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: '/tin-tuc/tam-mgo' } }] },
    ]);
  });

  it('<a href> khi không bật allowHref, thẻ lạ, lệch thẻ -> null', () => {
    expect(parseInline('<a href="/san-pham">x</a>')).toBeNull();
    expect(parseInline('<script>x</script>', { allowHref })).toBeNull();
    expect(parseInline('<b>x<i>y</b></i>', { allowHref })).toBeNull();
    expect(parseInline('<b href="/x">x</b>', { allowHref })).toBeNull();
  });

  it('plainInline bỏ thẻ, giữ chữ và xuống dòng', () => {
    expect(plainInline('<b>a</b><br/>b &amp; c')).toEqual([{ type: 'text', text: 'a\nb & c' }]);
  });

  it('serializeInline <-> parseInline (chế độ đánh số) giữ nguyên', () => {
    const nodes = [
      { type: 'text' as const, text: 'a < b ' },
      { type: 'text' as const, text: 'link', marks: [{ type: 'link' as const, attrs: { href: '/x' } }] },
    ];
    const { text, links } = serializeInline(nodes);
    expect(parseInline(text, { links })).toEqual(nodes);
  });
});

const FAQ_DOC: RichDoc = {
  type: 'doc',
  content: [
    { type: 'callout', attrs: { variant: 'summary' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tóm tắt' }] }] },
    {
      type: 'faq',
      content: [
        {
          type: 'faqItem',
          attrs: { question: 'Tấm MGO là gì?' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Là tấm magie oxit.' }] }],
        },
        {
          type: 'faqItem',
          attrs: { question: 'Chịu lửa bao lâu?' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tới EI 120.' }] }],
        },
      ],
    },
  ],
};

describe('khối FAQ & Tóm tắt nhanh', () => {
  it('hợp lệ theo whitelist; câu hỏi rỗng bị từ chối', () => {
    expect(validateRichDoc(FAQ_DOC)).toEqual({ ok: true });
    const bad = { type: 'doc', content: [{ type: 'faq', content: [{ type: 'faqItem', attrs: { question: ' ' } }] }] };
    expect(validateRichDoc(bad).ok).toBe(false);
    expect(validateRichDoc({ type: 'doc', content: [{ type: 'faqItem' }] }).ok).toBe(false);
  });

  it('collectFaqItems lấy cặp hỏi–đáp; toPlainText có câu hỏi', () => {
    expect(collectFaqItems(FAQ_DOC)).toEqual([
      { question: 'Tấm MGO là gì?', answer: 'Là tấm magie oxit.' },
      { question: 'Chịu lửa bao lâu?', answer: 'Tới EI 120.' },
    ]);
    expect(toPlainText(FAQ_DOC)).toContain('Tấm MGO là gì?');
  });

  it('dịch AI: câu hỏi FAQ được tách đoạn và ghép lại', () => {
    const segs = collectSegments(FAQ_DOC);
    expect(segs).toMatchObject({ q0: 'Tấm MGO là gì?', q1: 'Chịu lửa bao lâu?' });
    const { doc } = applySegments(FAQ_DOC, { q0: 'What is MgO board?', t1: 'It is a magnesium oxide board.' });
    expect(collectFaqItems(doc)[0]).toEqual({ question: 'What is MgO board?', answer: 'It is a magnesium oxide board.' });
    expect(collectFaqItems(doc)[1].question).toBe('Chịu lửa bao lâu?');
  });
});
