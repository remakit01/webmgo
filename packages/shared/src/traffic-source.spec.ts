import { classifyTraffic, hostOf, isBotUserAgent } from './traffic-source.js';

const SITE = 'mgo.remak.vn';

describe('hostOf', () => {
  it('lấy host, bỏ www, chữ thường', () => {
    expect(hostOf('https://WWW.Google.com.vn/search?q=x')).toBe('google.com.vn');
    expect(hostOf('khong-phai-url')).toBeNull();
  });
});

describe('classifyTraffic', () => {
  const c = (referrer: string, utmSource?: string) => classifyTraffic({ referrer, utmSource, siteHost: SITE });

  it('không referrer -> DIRECT; có utm lạ -> OTHER', () => {
    expect(c('')).toBe('DIRECT');
    expect(c('', 'newsletter')).toBe('OTHER');
  });
  it('trợ lý AI: theo referrer hoặc utm_source của ChatGPT', () => {
    expect(c('https://chatgpt.com/')).toBe('AI');
    expect(c('', 'chatgpt.com')).toBe('AI');
    expect(c('https://www.perplexity.ai/search/abc')).toBe('AI');
    expect(c('https://gemini.google.com/app')).toBe('AI');
    expect(c('https://copilot.microsoft.com/')).toBe('AI');
    expect(c('https://www.bing.com/chat?q=x')).toBe('AI');
  });
  it('công cụ tìm kiếm', () => {
    expect(c('https://www.google.com/')).toBe('SEARCH');
    expect(c('https://www.google.com.vn/')).toBe('SEARCH');
    expect(c('https://www.bing.com/search?q=mgo')).toBe('SEARCH');
    expect(c('https://coccoc.com/search?query=mgo')).toBe('SEARCH');
  });
  it('mạng xã hội', () => {
    expect(c('https://l.facebook.com/')).toBe('SOCIAL');
    expect(c('https://zalo.me/')).toBe('SOCIAL');
    expect(c('https://t.co/abc')).toBe('SOCIAL');
  });
  it('cùng site -> INTERNAL; site khác -> OTHER', () => {
    expect(c('https://mgo.remak.vn/tin-tuc')).toBe('INTERNAL');
    expect(c('https://www.mgo.remak.vn/')).toBe('INTERNAL');
    expect(c('https://baoxaydung.vn/bai-viet')).toBe('OTHER');
  });
  it('không nhầm tên miền chứa chữ google ở chỗ khác', () => {
    expect(c('https://notgoogle.example.com/')).toBe('OTHER');
  });
});

describe('isBotUserAgent', () => {
  it('nhận ra bot / trình xem trước link / công cụ tự động', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('facebookexternalhit/1.1')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 HeadlessChrome/120')).toBe(true);
    expect(isBotUserAgent('')).toBe(true);
  });
  it('trình duyệt thật thì không', () => {
    expect(isBotUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36')).toBe(false);
    expect(isBotUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 Mobile Safari/604.1')).toBe(false);
  });
});
