import { applySegments, collectSegments } from './rich-translate.js';
import { validateRichDoc, type RichDoc } from './rich-content.js';

const IMG = 'http://localhost:9000/remak-mgo-assets/news/content/a/1920.webp';

const DOC: RichDoc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Tấm MGO là gì?' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Tấm ' },
        { type: 'text', text: 'MGO', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' đạt ' },
        { type: 'text', text: 'QCVN 06', marks: [{ type: 'link', attrs: { href: '/tieu-chuan', target: null } }] },
        { type: 'hardBreak' },
        { type: 'text', text: 'a < b & c' },
      ],
    },
    { type: 'paragraph' },
    { type: 'image', attrs: { src: IMG, alt: 'Ảnh tấm', caption: 'Chú thích' } },
    {
      type: 'bulletList',
      content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mục một' }] }] }],
    },
    { type: 'relatedPost', attrs: { postId: 'p2' } },
    { type: 'youtube', attrs: { src: 'https://youtu.be/dQw4w9WgXcQ' } },
  ],
};

describe('collectSegments', () => {
  it('mỗi khối chữ một đoạn, định dạng thành thẻ giữ chỗ, bỏ khối rỗng', () => {
    expect(collectSegments(DOC)).toEqual({
      t0: 'Tấm MGO là gì?',
      t1: 'Tấm <b>MGO</b> đạt <a1>QCVN 06</a1><br/>a &lt; b &amp; c',
      alt0: 'Ảnh tấm',
      cap0: 'Chú thích',
      t3: 'Mục một',
    });
  });
});

describe('applySegments', () => {
  it('ghép bản dịch giữ nguyên link, ảnh, video, bài liên quan và hợp lệ theo whitelist', () => {
    const { doc, fallbackBlocks } = applySegments(DOC, {
      t0: 'What is MgO board?',
      t1: '<b>MgO</b> board meets <a1>QCVN 06</a1><br/>a &lt; b &amp; c',
      alt0: 'MgO board photo',
      cap0: 'Caption',
      t3: 'Item one',
    });
    expect(fallbackBlocks).toEqual([]);
    expect(validateRichDoc(doc).ok).toBe(true);
    expect(doc.content[1].content).toEqual([
      { type: 'text', text: 'MgO', marks: [{ type: 'bold' }] },
      { type: 'text', text: ' board meets ' },
      { type: 'text', text: 'QCVN 06', marks: [{ type: 'link', attrs: { href: '/tieu-chuan', target: null } }] },
      { type: 'hardBreak' },
      { type: 'text', text: 'a < b & c' },
    ]);
    expect(doc.content[3].attrs).toEqual({ src: IMG, alt: 'MgO board photo', caption: 'Caption' });
    expect(doc.content[5]).toEqual(DOC.content[5]);
    expect(doc.content[6]).toEqual(DOC.content[6]);
    // không sửa tài liệu gốc
    expect(DOC.content[0].content?.[0].text).toBe('Tấm MGO là gì?');
  });

  it('thẻ trả về bị lệch/lạ -> khối đó dùng chữ thuần, không hỏng tài liệu', () => {
    const { doc, fallbackBlocks } = applySegments(DOC, { t1: '<b>MgO board <i>meets</b> <a9>x</a9>' });
    expect(fallbackBlocks).toEqual(['t1']);
    expect(doc.content[1].content).toEqual([{ type: 'text', text: 'MgO board meets x' }]);
    expect(validateRichDoc(doc).ok).toBe(true);
  });

  it('đoạn không có bản dịch giữ nguyên', () => {
    const { doc } = applySegments(DOC, {});
    expect(doc).toEqual(DOC);
  });
});
