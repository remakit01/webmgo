import { formatDate, isLocale } from './locale.js';

describe('isLocale', () => {
  it('chỉ nhận ngôn ngữ được hỗ trợ', () => {
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('formatDate', () => {
  it('định dạng theo ngôn ngữ và múi giờ Việt Nam', () => {
    // 2026-10-04T18:30Z = 01:30 ngày 05/10 giờ Việt Nam
    expect(formatDate('2026-10-04T18:30:00.000Z', 'vi')).toBe('05/10/2026');
    expect(formatDate(new Date('2026-10-04T18:30:00.000Z'), 'en')).toBe('Oct 5, 2026');
  });

  it('ngày không hợp lệ trả chuỗi rỗng', () => {
    expect(formatDate('khong-phai-ngay', 'vi')).toBe('');
  });
});
