import { isPubliclyVisible, resolveStatusOnPublish } from './publishing.js';

const NOW = new Date('2026-10-05T03:00:00Z');

describe('resolveStatusOnPublish', () => {
  it('không truyền thời điểm -> đăng ngay', () => {
    expect(resolveStatusOnPublish(undefined, NOW)).toEqual({ status: 'PUBLISHED', publishedAt: NOW });
  });

  it('tương lai -> lên lịch, quá khứ -> đăng ngay giữ ngày gốc', () => {
    const future = new Date('2026-10-06T00:00:00Z');
    const past = new Date('2025-01-01T00:00:00Z');
    expect(resolveStatusOnPublish(future, NOW)).toEqual({ status: 'SCHEDULED', publishedAt: future });
    expect(resolveStatusOnPublish(past, NOW)).toEqual({ status: 'PUBLISHED', publishedAt: past });
  });
});

describe('isPubliclyVisible', () => {
  it('chỉ PUBLISHED và đã tới giờ', () => {
    expect(isPubliclyVisible({ status: 'PUBLISHED', publishedAt: '2026-10-05T02:00:00Z' }, NOW)).toBe(true);
    expect(isPubliclyVisible({ status: 'PUBLISHED', publishedAt: '2026-10-05T04:00:00Z' }, NOW)).toBe(false);
    expect(isPubliclyVisible({ status: 'SCHEDULED', publishedAt: '2026-10-05T02:00:00Z' }, NOW)).toBe(false);
    expect(isPubliclyVisible({ status: 'DRAFT', publishedAt: null }, NOW)).toBe(false);
  });
});
