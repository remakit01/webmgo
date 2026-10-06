import type { NewsListItem } from '@remak/shared/contracts/news';
import { getNewsList } from '@/lib/api';
import { newsIndexPath, newsPostPath } from '@/lib/news-paths';
import { absoluteUrl } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

// /llms.txt (llmstxt.org): bản tóm tắt site dạng Markdown để ChatGPT, Perplexity, Claude… đọc nhanh.
// Danh sách bài lấy từ API (tag "news"), CMS lưu bài thì ISR tự làm mới.
export const revalidate = 60;

const POSTS_PER_LOCALE = 20;

// Trang chính của site (URL tiếng Việt / tiếng Anh theo routing.pathnames)
const MAIN_PAGES: { title: string; vi: string; en: string; note: string }[] = [
  { title: 'Sản phẩm / Products', vi: '/san-pham', en: '/en/products', note: 'Danh mục tấm MGO FireOFF và thông số kỹ thuật' },
  { title: 'Giải pháp ứng dụng / Applications', vi: '/giai-phap-ung-dung', en: '/en/applications', note: 'Ống gió, vách ngăn, trần, sàn chống cháy' },
  { title: 'Dự án / Projects', vi: '/du-an', en: '/en/projects', note: 'Công trình đã thi công' },
  { title: 'Thư viện tài liệu / Tech library', vi: '/thu-vien-tai-lieu', en: '/en/tech-library', note: 'Chứng nhận, báo cáo thử nghiệm, catalogue' },
  { title: 'Hướng dẫn thi công / Construction guide', vi: '/huong-dan-thi-cong', en: '/en/construction-guide', note: 'Quy trình lắp đặt' },
  { title: 'Báo giá / Quote', vi: '/bao-gia', en: '/en/quote', note: 'Yêu cầu báo giá' },
  { title: 'FAQ', vi: '/faq', en: '/en/faq', note: 'Câu hỏi thường gặp' },
];

// Markdown: bỏ xuống dòng và ký tự dễ phá cấu trúc danh sách
const oneLine = (s: string) => s.replace(/\s+/g, ' ').replace(/[[\]]/g, '').trim();

function postLines(locale: Locale, posts: NewsListItem[]): string[] {
  return posts.map((p) => {
    const sapo = oneLine(p.sapo);
    return `- [${oneLine(p.title)}](${absoluteUrl(newsPostPath(locale, p.slug))})${sapo ? `: ${sapo}` : ''}`;
  });
}

export async function GET() {
  const [vi, en] = await Promise.all([
    getNewsList('vi', { pageSize: POSTS_PER_LOCALE }),
    getNewsList('en', { pageSize: POSTS_PER_LOCALE }),
  ]);

  const lines = [
    '# Remak® FireOFF — Tấm chống cháy MGO',
    '',
    '> Remak® Vietnam sản xuất và phân phối tấm chống cháy Magie Oxit (MGO) FireOFF cho ống gió, vách ngăn, trần và sàn, đạt yêu cầu PCCC theo QCVN 06:2022/BXD. Remak® Vietnam manufactures FireOFF magnesium oxide (MgO) fire-rated boards for ducts, partitions, ceilings and floors.',
    '',
    '## Trang chính / Main pages',
    '',
    `- [Trang chủ / Home](${absoluteUrl('/')})`,
    ...MAIN_PAGES.map((p) => `- [${p.title}](${absoluteUrl(p.vi)}): ${p.note} — EN: ${absoluteUrl(p.en)}`),
    '',
    `## Tin tức kỹ thuật (tiếng Việt)`,
    '',
    `- [Tất cả bài viết](${absoluteUrl(newsIndexPath('vi'))})`,
    ...postLines('vi', vi?.items ?? []),
  ];

  const enPosts = en?.items ?? [];
  if (enPosts.length) {
    lines.push('', '## Technical news (English)', '', `- [All articles](${absoluteUrl(newsIndexPath('en'))})`, ...postLines('en', enPosts));
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
