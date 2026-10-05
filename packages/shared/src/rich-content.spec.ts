import {
  collectImageSrcs,
  collectRelatedPostIds,
  extractHeadings,
  readingMinutes,
  richDocFromParagraphs,
  stableStringify,
  toPlainText,
  validateRichDoc,
  youtubeId,
  type RichDoc,
} from './rich-content.js';

const IMG = 'http://localhost:9000/remak-mgo-assets/news/content/abc/1920.webp';

const cellPara = (text: string) => [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text }] }];

const DOC: RichDoc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Tổng quan MGO' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Tấm ' },
        { type: 'text', text: 'MGO', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' xem ', marks: [] },
        { type: 'text', text: 'tại đây', marks: [{ type: 'link', attrs: { href: '/san-pham', target: null } }] },
      ],
    },
    { type: 'image', attrs: { src: IMG, alt: 'Tấm MGO', caption: 'Ảnh thực tế' } },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', attrs: { colspan: 1, rowspan: 1, colwidth: null, align: null }, content: cellPara('Độ dày') },
            { type: 'tableCell', content: cellPara('9 mm') },
          ],
        },
      ],
    },
    { type: 'callout', attrs: { variant: 'warning' }, content: cellPara('Lưu ý') },
    { type: 'relatedPost', attrs: { postId: 'cmabc123' } },
    { type: 'youtube', attrs: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Tổng quan MGO' }] },
    { type: 'horizontalRule' },
  ],
};

const docOf = (...content: unknown[]) => ({ type: 'doc', content });

describe('validateRichDoc', () => {
  it('chấp nhận tài liệu hợp lệ đủ các khối', () => {
    expect(validateRichDoc(DOC)).toEqual({ ok: true });
  });

  it('từ chối gốc không phải doc', () => {
    expect(validateRichDoc(null).ok).toBe(false);
    expect(validateRichDoc({ type: 'paragraph', content: [] }).ok).toBe(false);
  });

  it('chặn link javascript: trong nội dung', () => {
    const r = validateRichDoc(
      docOf({ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('link');
  });

  it('chặn node/mark/thuộc tính lạ', () => {
    expect(validateRichDoc(docOf({ type: 'iframe' })).ok).toBe(false);
    expect(validateRichDoc(docOf({ type: 'paragraph', attrs: { onclick: 'x' } })).ok).toBe(false);
    expect(validateRichDoc(docOf({ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'highlight' }] }] })).ok).toBe(false);
    expect(validateRichDoc(docOf({ type: 'paragraph', html: '<b>x</b>' })).ok).toBe(false);
  });

  it('ảnh phải có alt và đúng nguồn cho phép', () => {
    const img = (attrs: Record<string, unknown>) => docOf({ type: 'image', attrs });
    expect(validateRichDoc(img({ src: IMG, alt: '' })).ok).toBe(false);
    const onlyMinio = { isAllowedImageSrc: (src: string) => src.startsWith('http://localhost:9000/') };
    expect(validateRichDoc(img({ src: IMG, alt: 'a' }), onlyMinio).ok).toBe(true);
    expect(validateRichDoc(img({ src: 'https://evil.com/x.png', alt: 'a' }), onlyMinio).ok).toBe(false);
    expect(validateRichDoc(img({ src: 'data:image/png;base64,xx', alt: 'a' })).ok).toBe(false);
  });

  it('chỉ nhận H2–H4 và video YouTube', () => {
    expect(validateRichDoc(docOf({ type: 'heading', attrs: { level: 1 } })).ok).toBe(false);
    expect(validateRichDoc(docOf({ type: 'youtube', attrs: { src: 'https://vimeo.com/1' } })).ok).toBe(false);
  });

  it('chặn lồng quá sâu', () => {
    let node: Record<string, unknown> = { type: 'paragraph' };
    for (let i = 0; i < 20; i++) node = { type: 'blockquote', content: [node] };
    expect(validateRichDoc(docOf(node)).ok).toBe(false);
  });
});

describe('stableStringify', () => {
  it('không phụ thuộc thứ tự key (JSONB đổi thứ tự key)', () => {
    expect(stableStringify({ type: 'doc', content: [{ attrs: { b: 1, a: 2 }, type: 'x' }] })).toBe(
      stableStringify({ content: [{ type: 'x', attrs: { a: 2, b: 1 } }], type: 'doc' }),
    );
    expect(stableStringify({ a: 1 })).not.toBe(stableStringify({ a: 2 }));
  });
});

describe('đọc nội dung', () => {
  it('toPlainText gồm đoạn văn, chú thích ảnh, ô bảng', () => {
    expect(toPlainText(DOC).split('\n')).toEqual([
      'Tổng quan MGO',
      'Tấm MGO xem tại đây',
      'Ảnh thực tế',
      'Độ dày',
      '9 mm',
      'Lưu ý',
      'Tổng quan MGO',
    ]);
  });

  it('readingMinutes tối thiểu 1, làm tròn lên', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('a '.repeat(221))).toBe(2);
  });

  it('extractHeadings sinh id neo duy nhất', () => {
    expect(extractHeadings(DOC)).toEqual([
      { id: 'tong-quan-mgo', text: 'Tổng quan MGO', level: 2 },
      { id: 'tong-quan-mgo-2', text: 'Tổng quan MGO', level: 3 },
    ]);
  });

  it('thu thập bài liên quan và ảnh', () => {
    expect(collectRelatedPostIds(DOC)).toEqual(['cmabc123']);
    expect(collectImageSrcs(DOC)).toEqual([IMG]);
  });

  it('youtubeId nhận các dạng URL phổ biến, chặn domain giả', () => {
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://www.youtube.com/embed/dQw4w9WgXcQ?start=3')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });

  it('richDocFromParagraphs chuyển dữ liệu cũ string[] và luôn hợp lệ', () => {
    const doc = richDocFromParagraphs(['  Đoạn 1 ', '', 'Đoạn 2']);
    expect(doc.content).toHaveLength(2);
    expect(validateRichDoc(doc).ok).toBe(true);
    expect(validateRichDoc(richDocFromParagraphs([])).ok).toBe(true);
  });
});
