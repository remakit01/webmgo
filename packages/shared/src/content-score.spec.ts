import { analyzeContent, contentScores, normalizeText, VERIFY_MARK, type ContentScoreInput } from './content-score.js';
import type { RichDoc, RichNode } from './rich-content.js';

const p = (text: string, marks?: RichNode['marks']): RichNode => ({ type: 'paragraph', content: [{ type: 'text', text, ...(marks ? { marks } : {}) }] });
const h = (level: number, text: string): RichNode => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const link = (text: string, href: string): RichNode => ({ type: 'paragraph', content: [{ type: 'text', text, marks: [{ type: 'link', attrs: { href } }] }] });
const filler = (n: number) => Array.from({ length: n }, (_, i) => `từ${i}`).join(' ');

const GOOD_DOC: RichDoc = {
  type: 'doc',
  content: [
    { type: 'callout', attrs: { variant: 'summary' }, content: [p('Tấm MGO chống cháy chịu lửa tới EI 120, không chứa amiăng.')] },
    h(2, 'Tấm MGO chống cháy là gì?'),
    p('Tấm MGO chống cháy là tấm magie oxit dùng bọc ống gió và vách ngăn, chịu nhiệt tới 1.200°C theo kết quả thử nghiệm của viện IBST.'),
    p(filler(250)),
    h(2, 'Thi công tấm MGO như thế nào?'),
    p('Thi công gồm ba bước chính, mỗi tấm dày 12 mm, khoảng cách vít 200 mm để đạt giới hạn chịu lửa EI 60.'),
    { type: 'orderedList', content: [{ type: 'listItem', content: [p('Đo và cắt tấm')] }] },
    p(filler(250)),
    { type: 'blockquote', content: [p('Tấm MGO giúp nghiệm thu nhanh hơn — Kỹ sư Nguyễn Văn A, Remak')] },
    link('Xem sản phẩm tấm MGO', '/san-pham'),
    link('QCVN 06:2022/BXD', 'https://moc.gov.vn/qcvn06'),
    link('Báo cáo IBST', 'https://ibst.vn/bao-cao'),
    {
      type: 'faq',
      content: ['Tấm MGO có chống ẩm không?', 'Tấm MGO dày bao nhiêu?', 'Tấm MGO giá bao nhiêu?'].map((q) => ({
        type: 'faqItem' as const,
        attrs: { question: q },
        content: [p(`Câu trả lời cho ${q} ${filler(30)}`)],
      })),
    },
  ],
};

const base: ContentScoreInput = {
  keyword: 'tấm MGO chống cháy',
  title: 'Tấm MGO chống cháy: thông số, thi công và nghiệm thu',
  slug: 'tam-mgo-chong-chay-thong-so-thi-cong',
  sapo: 'Tấm MGO chống cháy là vật liệu magie oxit chịu lửa tới EI 120, dùng bọc ống gió và vách ngăn; bài viết tổng hợp thông số, cách thi công và hồ sơ nghiệm thu PCCC theo QCVN 06.',
  seoTitle: 'Tấm MGO chống cháy: thông số và thi công chuẩn',
  seoDescription:
    'Tấm MGO chống cháy chịu lửa tới EI 120, không amiăng. Thông số kỹ thuật, cách thi công bọc ống gió, vách ngăn và hồ sơ nghiệm thu PCCC theo QCVN 06.',
  doc: GOOD_DOC,
  locale: 'vi',
  author: { name: 'Nguyễn Văn A', jobTitle: 'Kỹ sư PCCC' },
  publishedAt: '2026-09-01T00:00:00Z',
  now: new Date('2026-10-06T00:00:00Z'),
};

const status = (group: { checks: { id: string; status: string }[] }, id: string) => group.checks.find((c) => c.id === id)?.status;

describe('normalizeText', () => {
  it('bỏ dấu, chữ thường, đổi đ', () => {
    expect(normalizeText('Tấm MGO Đạt Chuẩn')).toBe('tam mgo dat chuan');
  });
});

describe('analyzeContent — bài tốt', () => {
  const r = analyzeContent(base);
  it('SEO: keyword ở tiêu đề, slug, mô tả, có link nội bộ', () => {
    expect(status(r.seo, 'seo-title-kw')).toBe('good');
    expect(status(r.seo, 'seo-slug-kw')).toBe('good');
    expect(status(r.seo, 'seo-meta-kw')).toBe('good');
    expect(status(r.seo, 'seo-internal-link')).toBe('good');
    expect(r.seo.score).toBeGreaterThanOrEqual(80);
  });
  it('AEO: tóm tắt nhanh, H2 dạng câu hỏi, FAQ, danh sách', () => {
    expect(status(r.aeo, 'aeo-summary')).toBe('good');
    expect(status(r.aeo, 'aeo-question-headings')).toBe('good');
    expect(status(r.aeo, 'aeo-faq')).toBe('good');
    expect(status(r.aeo, 'aeo-structured')).toBe('good');
    expect(r.aeo.score).toBeGreaterThanOrEqual(70);
  });
  it('GEO: số liệu có nguồn, 2 nguồn ngoài, trích dẫn chuyên gia, tác giả, định nghĩa, không nhồi keyword', () => {
    expect(status(r.geo, 'geo-statistics')).toBe('good');
    expect(status(r.geo, 'geo-sources')).toBe('good');
    expect(status(r.geo, 'geo-expert-quote')).toBe('good');
    expect(status(r.geo, 'geo-author')).toBe('good');
    expect(status(r.geo, 'geo-definition')).toBe('good');
    expect(status(r.geo, 'geo-no-stuffing')).toBe('good');
    expect(r.geo.score).toBeGreaterThanOrEqual(85);
  });
  it('GEO fan-out: tính tỉ lệ câu hỏi liên quan đã trả lời', () => {
    const withFanOut = analyzeContent({ ...base, fanOutQueries: ['tấm mgo dày bao nhiêu', 'tấm mgo chống ẩm', 'tấm mgo so với thạch cao'] });
    expect(withFanOut.geo.checks.find((c) => c.id === 'geo-fanout')?.message).toContain('2/3');
  });
});

describe('analyzeContent — bài kém', () => {
  it('không keyword -> các mục cần keyword chỉ cảnh báo', () => {
    const r = analyzeContent({ ...base, keyword: '' });
    expect(status(r.seo, 'seo-title-kw')).toBe('warn');
    expect(r.seo.checks.find((c) => c.id === 'seo-title-kw')?.message).toContain('Keyword chính');
  });

  it('nhồi keyword -> GEO trừ điểm', () => {
    const stuffed: RichDoc = { type: 'doc', content: [p(Array.from({ length: 40 }, () => 'tấm MGO chống cháy tốt').join(' '))] };
    const r = analyzeContent({ ...base, doc: stuffed });
    expect(status(r.geo, 'geo-no-stuffing')).toBe('bad');
    expect(status(r.seo, 'seo-density')).toBe('bad');
  });

  it('bài trống: thiếu FAQ, số liệu, nguồn, tác giả', () => {
    const r = analyzeContent({ ...base, doc: { type: 'doc', content: [p('Nội dung ngắn.')] }, author: null, sapo: '' });
    expect(status(r.aeo, 'aeo-faq')).toBe('bad');
    expect(status(r.geo, 'geo-statistics')).toBe('bad');
    expect(status(r.geo, 'geo-sources')).toBe('bad');
    expect(status(r.geo, 'geo-author')).toBe('bad');
    expect(status(r.seo, 'seo-length')).toBe('bad');
    expect(r.geo.score).toBeLessThan(40);
  });

  it('nội dung cũ hơn 2 năm -> độ mới kém', () => {
    const r = analyzeContent({ ...base, publishedAt: '2024-01-01T00:00:00Z' });
    expect(status(r.geo, 'geo-freshness')).toBe('bad');
  });

  it('còn [cần kiểm chứng] -> GEO đỏ, nặng điểm', () => {
    const marked: RichDoc = { type: 'doc', content: [...GOOD_DOC.content, p(`Tỷ trọng 963 kg/m³ ${VERIFY_MARK}.`)] };
    const r = analyzeContent({ ...base, doc: marked });
    expect(status(r.geo, 'geo-verify-marks')).toBe('bad');
    expect(r.geo.score).toBeLessThan(analyzeContent(base).geo.score);
    expect(analyzeContent(base).geo.checks.find((c) => c.id === 'geo-verify-marks')).toBeUndefined();
  });

  it('thực thể: thiếu thương hiệu / tiêu chuẩn viết tắt không số hiệu -> cảnh báo', () => {
    const noBrand: RichDoc = { type: 'doc', content: [p('Tấm MGO đạt yêu cầu QCVN về chống cháy.')] };
    expect(status(analyzeContent({ ...base, doc: noBrand }).geo, 'geo-entity')).toBe('warn');
    expect(status(analyzeContent(base).geo, 'geo-entity')).toBe('good');
  });

  it('FAQ trả lời quá ngắn -> cảnh báo độ dài', () => {
    const shortFaq: RichDoc = {
      type: 'doc',
      content: [{ type: 'faq', content: [{ type: 'faqItem', attrs: { question: 'Hỏi?' }, content: [p('Có.')] }] }],
    };
    expect(status(analyzeContent({ ...base, doc: shortFaq }).aeo, 'aeo-faq-answers')).toBe('warn');
  });

  it('contentScores bỏ các mục ngoài nội dung (tác giả, độ mới...)', () => {
    const r = analyzeContent({ ...base, author: null, publishedAt: '2020-01-01T00:00:00Z' });
    expect(contentScores(r).geo).toBeGreaterThan(r.geo.score);
  });

  it('tiêu đề tiếng Anh dạng câu hỏi được nhận diện', () => {
    const en: RichDoc = { type: 'doc', content: [h(2, 'What is MgO board'), p('x'), h(2, 'How to install it'), p('y')] };
    const r = analyzeContent({ ...base, locale: 'en', keyword: 'MgO board', doc: en });
    expect(status(r.aeo, 'aeo-question-headings')).toBe('good');
  });

  it('kiểm tra SEO ảnh: số lượng, alt và keyword trong alt', () => {
    // Không có ảnh
    const noImg = analyzeContent({ ...base, doc: { type: 'doc', content: [p('Bài viết không có ảnh')] } });
    expect(status(noImg.seo, 'seo-image-count')).toBe('warn');
    expect(status(noImg.seo, 'seo-image-alt')).toBe('warn');
    expect(status(noImg.seo, 'seo-image-alt-kw')).toBe('warn');

    // Có ảnh nhưng thiếu alt
    const imgNoAlt: RichDoc = {
      type: 'doc',
      content: [{ type: 'image', attrs: { src: 'https://example.com/a.jpg', alt: '' } }],
    };
    const rNoAlt = analyzeContent({ ...base, doc: imgNoAlt });
    expect(status(rNoAlt.seo, 'seo-image-count')).toBe('good');
    expect(status(rNoAlt.seo, 'seo-image-alt')).toBe('bad');
    expect(status(rNoAlt.seo, 'seo-image-alt-kw')).toBe('warn');

    // Có ảnh với alt chuẩn chứa từ khóa
    const imgGood: RichDoc = {
      type: 'doc',
      content: [{ type: 'image', attrs: { src: 'https://example.com/a.jpg', alt: 'Tấm MGO chống cháy thực tế bọc ống gió' } }],
    };
    const rGood = analyzeContent({ ...base, doc: imgGood });
    expect(status(rGood.seo, 'seo-image-count')).toBe('good');
    expect(status(rGood.seo, 'seo-image-alt')).toBe('good');
    expect(status(rGood.seo, 'seo-image-alt-kw')).toBe('good');
  });
});
