import { isInternalLink, isSafeLink } from './link.js';

describe('isSafeLink', () => {
  it('cho phép đường dẫn nội bộ và http(s)', () => {
    expect(isSafeLink('/nhan-mau-thu')).toBe(true);
    expect(isSafeLink('https://remak.vn/a?b=1')).toBe(true);
    expect(isSafeLink('http://example.com')).toBe(true);
  });

  it('chặn javascript:, data:, //evil.com và khoảng trắng', () => {
    expect(isSafeLink('javascript:alert(1)')).toBe(false);
    expect(isSafeLink('data:text/html,x')).toBe(false);
    expect(isSafeLink('//evil.com')).toBe(false);
    expect(isSafeLink('/a b')).toBe(false);
  });

  it('neo "#..." chỉ hợp lệ khi bật allowAnchor', () => {
    expect(isSafeLink('#du-toan')).toBe(false);
    expect(isSafeLink('#du-toan', { allowAnchor: true })).toBe(true);
  });
});

describe('isInternalLink', () => {
  it('phân biệt link nội bộ với link ngoài', () => {
    expect(isInternalLink('/tin-tuc')).toBe(true);
    expect(isInternalLink('//cdn.com/x')).toBe(false);
    expect(isInternalLink('https://remak.vn')).toBe(false);
  });
});
