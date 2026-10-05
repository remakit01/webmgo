import { isValidSlug, slugify, SLUG_MAX_LENGTH, withSlugSuffix } from './slug.js';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và đổi đ/Đ thành d', () => {
    expect(slugify('Tôi là ABC')).toBe('toi-la-abc');
    expect(slugify('Đặc tính chống cháy của tấm MGO')).toBe('dac-tinh-chong-chay-cua-tam-mgo');
    expect(slugify('Nghiệm thu PCCC — Quy chuẩn QCVN 06:2022/BXD')).toBe('nghiem-thu-pccc-quy-chuan-qcvn-06-2022-bxd');
  });

  it('gộp ký tự đặc biệt/khoảng trắng liên tiếp và bỏ gạch nối ở đầu/cuối', () => {
    expect(slugify('  I am   ABC!!  ')).toBe('i-am-abc');
    expect(slugify('--MgO  vs  Gypsum--')).toBe('mgo-vs-gypsum');
    expect(slugify('!!!')).toBe('');
  });

  it('cắt tối đa SLUG_MAX_LENGTH ký tự, ưu tiên ranh giới từ', () => {
    const slug = slugify('tam chong chay '.repeat(20));
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug.endsWith('-')).toBe(false);
    expect(isValidSlug(slug)).toBe(true);
  });
});

describe('isValidSlug', () => {
  it('chấp nhận slug chuẩn, từ chối chữ hoa, dấu, gạch nối kép', () => {
    expect(isValidSlug('i-am-abc')).toBe(true);
    expect(isValidSlug('mgo-2026')).toBe(true);
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('I-am')).toBe(false);
    expect(isValidSlug('tôi-là')).toBe(false);
    expect(isValidSlug('a--b')).toBe(false);
    expect(isValidSlug('-ab')).toBe(false);
    expect(isValidSlug('a'.repeat(SLUG_MAX_LENGTH + 1))).toBe(false);
  });
});

describe('withSlugSuffix', () => {
  it('thêm hậu tố số và vẫn giữ trong giới hạn độ dài', () => {
    expect(withSlugSuffix('toi-la-abc', 2)).toBe('toi-la-abc-2');
    const long = withSlugSuffix('a'.repeat(SLUG_MAX_LENGTH), 12);
    expect(long.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(long.endsWith('-12')).toBe(true);
  });
});
