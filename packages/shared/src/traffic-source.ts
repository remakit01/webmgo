// Phân loại nguồn truy cập của một lượt xem (đo hiệu quả SEO / GEO): Google, công cụ AI, mạng xã hội...
// Dùng chung: api (lưu thống kê) và fe (nhãn hiển thị trong CMS).

export const TRAFFIC_SOURCES = ['DIRECT', 'INTERNAL', 'SEARCH', 'AI', 'SOCIAL', 'OTHER'] as const;
export type TrafficSource = (typeof TRAFFIC_SOURCES)[number];

export const TRAFFIC_SOURCE_LABEL: Record<TrafficSource, string> = {
  DIRECT: 'Truy cập trực tiếp',
  INTERNAL: 'Từ trang khác trên site',
  SEARCH: 'Công cụ tìm kiếm (Google...)',
  AI: 'Trợ lý AI (ChatGPT, Perplexity...)',
  SOCIAL: 'Mạng xã hội',
  OTHER: 'Website khác',
};

/** Dưới mức này trang public không hiện số lượt xem (bài mới không trông vắng) */
export const PUBLIC_VIEWS_MIN = 50;

// Tên miền (khớp đuôi). AI trước SEARCH: gemini.google.com / bing.com/chat là AI chứ không phải tìm kiếm.
const AI_HOSTS = ['chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'gemini.google.com', 'bard.google.com', 'copilot.microsoft.com', 'claude.ai', 'you.com', 'phind.com', 'meta.ai', 'deepseek.com', 'grok.com'];
const AI_UTM = /^(chatgpt\.com|chatgpt|openai|perplexity|gemini|copilot|claude)/i;
const SEARCH_HOSTS = ['google', 'bing.com', 'coccoc.com', 'yahoo.com', 'duckduckgo.com', 'yandex', 'baidu.com', 'ecosia.org', 'search.brave.com'];
const SOCIAL_HOSTS = ['facebook.com', 'fb.com', 'm.facebook.com', 'l.facebook.com', 'zalo.me', 'zalo.vn', 'chat.zalo.me', 'linkedin.com', 'lnkd.in', 'youtube.com', 'youtu.be', 'tiktok.com', 't.co', 'x.com', 'twitter.com', 'instagram.com', 'threads.net', 'pinterest.com', 'reddit.com'];

/** Host (chữ thường, bỏ "www.") từ URL; không phải URL hợp lệ -> null. Không dùng URL của DOM/Node (package thuần TS) */
export function hostOf(url: string): string | null {
  const m = /^[a-z][a-z0-9+.-]*:\/\/(?:[^@/?#]*@)?([^/:?#]+)/i.exec(url.trim());
  return m ? m[1].toLowerCase().replace(/^www\./, '') : null;
}

const matches = (host: string, list: string[]) =>
  list.some((h) => (h.includes('.') ? host === h || host.endsWith(`.${h}`) : host === h || host.startsWith(`${h}.`) || host.includes(`.${h}.`)));

export interface TrafficInput {
  /** document.referrer */
  referrer?: string | null;
  /** utm_source của URL trang (ChatGPT gắn utm_source=chatgpt.com) */
  utmSource?: string | null;
  /** Host của chính site (để nhận ra INTERNAL) */
  siteHost?: string | null;
}

export function classifyTraffic(input: TrafficInput): TrafficSource {
  const utm = input.utmSource?.trim() ?? '';
  if (utm && AI_UTM.test(utm)) return 'AI';
  const referrer = input.referrer?.trim() ?? '';
  const host = referrer ? hostOf(referrer) : null;
  if (!host) return utm ? 'OTHER' : 'DIRECT';
  const site = input.siteHost ? input.siteHost.toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '') : null;
  if (site && (host === site || host.endsWith(`.${site}`))) return 'INTERNAL';
  if (matches(host, AI_HOSTS) || (host === 'bing.com' && /\/chat/i.test(referrer))) return 'AI';
  if (matches(host, SEARCH_HOSTS)) return 'SEARCH';
  if (matches(host, SOCIAL_HOSTS)) return 'SOCIAL';
  return 'OTHER';
}

/** Trình thu thập / xem trước link (không phải người đọc) — không đếm lượt xem */
export const BOT_USER_AGENT =
  /(bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|zalo(?:link|preview)|embedly|whatsapp|telegram|discord|skype|curl|wget|python-requests|axios|node-fetch|go-http|java\/|httpclient|phantomjs|puppeteer|playwright)/i;

export const isBotUserAgent = (ua: string | null | undefined) => !ua || BOT_USER_AGENT.test(ua);
