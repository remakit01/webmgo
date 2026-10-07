import { describe, expect, it } from 'vitest';
import { normalizeSearchText } from './text.js';

describe('normalizeSearchText', () => {
  it('bỏ dấu tiếng Việt, đ -> d, chữ thường', () => {
    expect(normalizeSearchText('Đường ống CHỐNG CHÁY')).toBe('duong ong chong chay');
    expect(normalizeSearchText('Ượ ỡ Ậ')).toBe('uo o a');
  });

  it('chuỗi tổ hợp NFD (macOS) cho cùng kết quả', () => {
    expect(normalizeSearchText('chống cháy'.normalize('NFD'))).toBe(normalizeSearchText('chống cháy'));
  });

  it('gộp + cắt khoảng trắng', () => {
    expect(normalizeSearchText('  Vách   ngăn ')).toBe('vach ngan');
  });
});
