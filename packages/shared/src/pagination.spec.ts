import { normalizePage, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, toPaginated } from './pagination.js';

describe('normalizePage', () => {
  it('mặc định trang 1, cỡ trang mặc định', () => {
    expect(normalizePage()).toEqual({ page: 1, pageSize: PAGE_SIZE_DEFAULT, skip: 0, take: PAGE_SIZE_DEFAULT });
  });

  it('chặn giá trị âm/lẻ và giới hạn cỡ trang tối đa', () => {
    expect(normalizePage(-2, 0).page).toBe(1);
    expect(normalizePage(1.5, 10).page).toBe(1);
    expect(normalizePage(3, 10_000)).toEqual({ page: 3, pageSize: PAGE_SIZE_MAX, skip: 2 * PAGE_SIZE_MAX, take: PAGE_SIZE_MAX });
  });
});

describe('toPaginated', () => {
  it('tính tổng số trang (tối thiểu 1)', () => {
    expect(toPaginated(['a'], 41, 1, 20).totalPages).toBe(3);
    expect(toPaginated([], 0, 1, 20).totalPages).toBe(1);
  });
});
