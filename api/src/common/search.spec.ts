import { describe, expect, it } from 'vitest';
import { likeContainsPattern } from './search.js';

describe('likeContainsPattern', () => {
  it('bọc % hai đầu, gộp khoảng trắng', () => {
    expect(likeContainsPattern('  chống   cháy ')).toBe('%chống cháy%');
  });

  it('thoát ký tự đặc biệt của LIKE', () => {
    expect(likeContainsPattern('50%')).toBe('%50\\%%');
    expect(likeContainsPattern('a_b')).toBe('%a\\_b%');
    expect(likeContainsPattern('c:\\x')).toBe('%c:\\\\x%');
  });

  it('rỗng -> null', () => {
    expect(likeContainsPattern('   ')).toBeNull();
    expect(likeContainsPattern(undefined)).toBeNull();
  });
});
