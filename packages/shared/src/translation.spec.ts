import { isTranslationStale, pickTranslated } from './translation.js';

describe('pickTranslated', () => {
  it('dùng bản dịch đã trim, rỗng/thiếu thì giữ bản gốc', () => {
    expect(pickTranslated('  Hello ', 'Xin chào')).toBe('Hello');
    expect(pickTranslated('   ', 'Xin chào')).toBe('Xin chào');
    expect(pickTranslated(undefined, 'Xin chào')).toBe('Xin chào');
    expect(pickTranslated(null, 'Xin chào')).toBe('Xin chào');
  });
});

describe('isTranslationStale', () => {
  it('lỗi thời khi bản gốc sửa sau lúc dịch', () => {
    expect(isTranslationStale('2026-10-05T10:00:00Z', '2026-10-05T09:00:00Z')).toBe(true);
    expect(isTranslationStale('2026-10-05T09:00:00Z', '2026-10-05T09:00:00Z')).toBe(false);
    expect(isTranslationStale(new Date('2026-10-05T10:00:00Z'), null)).toBe(false);
  });
});
