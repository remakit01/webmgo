import { routing, type Locale } from './routing';

/**
 * Đổi URL giữa các ngôn ngữ dựa trên `routing.pathnames` (nguồn duy nhất của bảng URL).
 * Code hiện có viết link bằng URL tiếng Việt (`/san-pham/tam-mgo`) — giữ nguyên cách viết đó,
 * toLocalePath sẽ đổi sang URL của ngôn ngữ đang xem (`/en/products/tam-mgo`).
 */

type Template = { internal: string; vi: string; en: string };
type PathKind = keyof Template;

// internal = tên thư mục trong app/[locale] (key của pathnames)
const TEMPLATES: Template[] = Object.entries(routing.pathnames).map(([internal, value]) =>
  typeof value === 'string' ? { internal, vi: value, en: value } : { internal, ...(value as Omit<Template, 'internal'>) },
);

const EN_PREFIX = '/en';

function toRegex(template: string) {
  const pattern = template
    .split('/')
    .map((seg) => (/^\[.+\]$/.test(seg) ? '([^/]+)' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${pattern}/?$`);
}

function fill(template: string, values: string[]) {
  let i = 0;
  return template
    .split('/')
    .map((seg) => (/^\[.+\]$/.test(seg) ? values[i++] : seg))
    .join('/');
}

/** Tách "/a/b?x=1#y" -> ["/a/b", "?x=1#y"] */
function splitSuffix(href: string): [string, string] {
  const idx = href.search(/[?#]/);
  return idx === -1 ? [href, ''] : [href.slice(0, idx), href.slice(idx)];
}

function translate(path: string, from: PathKind, to: PathKind): string | null {
  for (const t of TEMPLATES) {
    const m = toRegex(t[from]).exec(path);
    if (m) return fill(t[to], m.slice(1));
  }
  return null;
}

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

/** URL tiếng Việt -> URL theo `locale`. Link ngoài, "#anchor", file tĩnh, route không khai báo: giữ nguyên. */
export function toLocalePath(href: string, locale: Locale): string {
  if (locale === routing.defaultLocale || !isInternal(href)) return href;
  const [path, suffix] = splitSuffix(href);
  const translated = translate(path, 'vi', locale);
  if (translated === null) return href;
  return `${EN_PREFIX}${translated === '/' ? '' : translated}${suffix}` || EN_PREFIX;
}

const hasPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

/**
 * Pathname -> URL tiếng Việt tương ứng. Nhận cả 3 dạng:
 * - URL tiếng Anh trên trình duyệt: "/en/products/x" -> "/san-pham/x"
 * - Đường dẫn nội bộ sau rewrite của proxy (usePathname khi render ở server): "/vi/products/x" -> "/san-pham/x"
 * - URL tiếng Việt: giữ nguyên
 */
export function toViPath(pathname: string): string {
  const [path, suffix] = splitSuffix(pathname);
  for (const locale of routing.locales) {
    const prefix = `/${locale}`;
    if (!hasPrefix(path, prefix)) continue;
    const rest = path.slice(prefix.length) || '/';
    // "/en/..." là URL tiếng Anh; "/vi/..." chỉ xuất hiện ở dạng nội bộ (tiếng Việt không có tiền tố)
    return (translate(rest, locale === 'en' ? 'en' : 'internal', 'vi') ?? rest) + suffix;
  }
  return pathname;
}
