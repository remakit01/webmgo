import {
  addDays,
  addMonths,
  dayKeyToUtcRange,
  endOfMonth,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDayKey,
  formatDayShort,
  formatNumber,
  formatTime,
  isDayKey,
  parseDate,
  startOfMonth,
  toDayKey,
  todayKey,
  weekdayMonFirst,
} from './date.js';

describe('ngày theo giờ Việt Nam', () => {
  it('toDayKey: 23:30 UTC đã là ngày hôm sau ở VN', () => {
    expect(toDayKey('2026-10-06T23:30:00Z')).toBe('2026-10-07');
    expect(toDayKey('2026-10-06T16:59:59Z')).toBe('2026-10-06');
    expect(todayKey(new Date('2026-10-06T17:00:00Z'))).toBe('2026-10-07');
    expect(toDayKey('rac')).toBe('');
  });

  it('isDayKey chỉ nhận ngày có thật', () => {
    expect(isDayKey('2026-02-28')).toBe(true);
    expect(isDayKey('2026-02-29')).toBe(false);
    expect(isDayKey('2028-02-29')).toBe(true);
    expect(isDayKey('2026-13-01')).toBe(false);
  });

  it('cộng ngày / tháng, đầu / cuối tháng, thứ trong tuần', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
    expect(startOfMonth('2026-10-07')).toBe('2026-10-01');
    expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
    expect(weekdayMonFirst('2026-10-05')).toBe(0); // Thứ Hai
    expect(weekdayMonFirst('2026-10-11')).toBe(6); // Chủ nhật
  });
});

describe('định dạng (mặc định dd/mm/yyyy, không phụ thuộc máy)', () => {
  it('formatDate', () => {
    expect(formatDate('2026-10-04T18:30:00.000Z')).toBe('05/10/2026');
    expect(formatDate(new Date('2026-10-04T18:30:00.000Z'), 'en')).toBe('Oct 5, 2026');
    expect(formatDate('khong-phai-ngay')).toBe('');
  });
  it('formatDateTime / formatTime 24 giờ theo giờ VN', () => {
    expect(formatDateTime('2026-10-07T07:30:00Z')).toBe('07/10/2026 14:30');
    expect(formatDateTime('2026-10-06T17:05:00Z')).toBe('07/10/2026 00:05');
    expect(formatDateTime('2026-10-07T07:30:00Z', 'en')).toBe('Oct 7, 2026, 14:30');
    expect(formatTime('2026-10-07T07:30:00Z')).toBe('14:30');
  });
  it('formatDayKey / formatDayShort / formatDateRange', () => {
    expect(formatDayKey('2026-10-07')).toBe('07/10/2026');
    expect(formatDayShort('2026-10-07')).toBe('07/10');
    expect(formatDateRange('2026-10-01', '2026-10-07')).toBe('01/10/2026 – 07/10/2026');
    expect(formatDateRange('2026-10-07', '2026-10-07')).toBe('07/10/2026');
    expect(formatDateRange('2026-10-01')).toBe('Từ 01/10/2026');
    expect(formatDateRange(null, '2026-10-07')).toBe('Đến 07/10/2026');
    expect(formatDateRange()).toBe('');
  });
  it('formatNumber', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(1234.5)).toBe('1.234,5');
    expect(formatNumber(-1000, 'en')).toBe('-1,000');
    expect(formatNumber(12)).toBe('12');
  });
});

describe('parseDate (ngày trước tháng)', () => {
  it('nhận nhiều cách gõ', () => {
    expect(parseDate('7/10/2026')).toBe('2026-10-07');
    expect(parseDate(' 07-10-2026 ')).toBe('2026-10-07');
    expect(parseDate('07.10.2026')).toBe('2026-10-07');
    expect(parseDate('2026-10-07')).toBe('2026-10-07');
  });
  it('ngày không có thật / sai dạng -> null', () => {
    expect(parseDate('31/02/2026')).toBeNull();
    expect(parseDate('29/02/2026')).toBeNull();
    expect(parseDate('10/2026')).toBeNull();
    expect(parseDate('abc')).toBeNull();
  });
});

describe('dayKeyToUtcRange (lọc DB theo ngày giờ VN)', () => {
  it('[00:00 VN ngày đầu, 00:00 VN ngày sau ngày cuối)', () => {
    const r = dayKeyToUtcRange('2026-10-07', '2026-10-07');
    expect(r.gte?.toISOString()).toBe('2026-10-06T17:00:00.000Z');
    expect(r.lt?.toISOString()).toBe('2026-10-07T17:00:00.000Z');
  });
  it('01:00 sáng VN (18:00 UTC hôm trước) nằm trong ngày VN', () => {
    const r = dayKeyToUtcRange('2026-10-07', '2026-10-07');
    const t = new Date('2026-10-06T18:00:00Z');
    expect(t >= r.gte! && t < r.lt!).toBe(true);
  });
  it('bỏ trống / không hợp lệ -> không ràng buộc', () => {
    expect(dayKeyToUtcRange()).toEqual({});
    expect(dayKeyToUtcRange('31/02/2026')).toEqual({});
  });
});
