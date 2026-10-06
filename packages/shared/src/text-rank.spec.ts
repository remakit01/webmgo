import { bm25Rank, chunkText, cosine, expandQuery, overlapRatio, rrfFuse, tokenize } from './text-rank.js';

describe('tokenize', () => {
  it('bỏ dấu, chữ thường, giữ số 1 chữ số', () => {
    expect(tokenize('Tấm MGO dày 6 mm, EI 60')).toEqual(['tam', 'mgo', 'day', '6', 'mm', 'ei', '60']);
  });
});

describe('bm25Rank', () => {
  const docs = [
    { id: 'duct', text: 'Tấm MGO bọc ống gió đạt EI 60, dày 12 mm' },
    { id: 'wall', text: 'Vách ngăn chống cháy dùng tấm MGO 2 lớp' },
    { id: 'other', text: 'Hướng dẫn bảo quản kho bãi' },
    { id: 'scatter', text: 'gió thổi qua ống khói của nhà máy, tấm lợp' },
  ];
  it('khớp không dấu, tài liệu không liên quan bị loại', () => {
    const hits = bm25Rank('tam mgo boc ong gio', docs);
    expect(hits[0].id).toBe('duct');
    expect(hits.map((h) => h.id)).not.toContain('other');
  });
  it('bigram ưu tiên khớp đúng cụm', () => {
    const hits = bm25Rank('ống gió', docs);
    expect(hits[0].id).toBe('duct');
  });
  it('truy vấn rỗng -> []', () => {
    expect(bm25Rank('  ', docs)).toEqual([]);
  });
});

describe('cosine', () => {
  it('cùng hướng = 1, vuông góc = 0, khác chiều = 0', () => {
    expect(cosine([1, 2], [2, 4])).toBeCloseTo(1);
    expect(cosine([1, 0], [0, 1])).toBe(0);
    expect(cosine([1], [1, 2])).toBe(0);
  });
});

describe('rrfFuse', () => {
  it('tài liệu đứng cao ở cả hai bảng lên đầu', () => {
    const fused = rrfFuse([
      ['a', 'b', 'c'],
      ['b', 'a', 'd'],
    ]);
    expect(fused.slice(0, 2).map((h) => h.id).sort()).toEqual(['a', 'b']);
    expect(fused.map((h) => h.id)).toContain('d');
  });
});

describe('chunkText', () => {
  it('gom đoạn ngắn, không vượt giới hạn', () => {
    const text = Array.from({ length: 10 }, (_, i) => `Đoạn số ${i} có nội dung khá dài để kiểm tra việc chia nhỏ văn bản.`).join('\n');
    const chunks = chunkText(text, 200);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 200)).toBe(true);
    expect(chunks.join('\n').replace(/\s+/g, ' ')).toContain('Đoạn số 9');
  });
  it('đoạn quá dài không dấu câu -> cắt cứng', () => {
    const chunks = chunkText('a'.repeat(500), 200);
    expect(chunks.map((c) => c.length)).toEqual([200, 200, 100]);
  });
});

describe('expandQuery', () => {
  it('nối từ đồng nghĩa khi truy vấn có từ khoá', () => {
    expect(expandQuery('Giá tấm 12 ly', { ly: 'mm', gia: 'don gia' })).toContain('mm');
    expect(expandQuery('Tấm 12 mm', { ly: 'mm' })).toBe('Tấm 12 mm');
  });
});

describe('overlapRatio', () => {
  it('đo trùng theo văn bản ngắn hơn', () => {
    expect(overlapRatio('Tấm MGO dày 12 mm', 'Tấm MGO dày 12 mm đạt EI 60 theo QCVN')).toBe(1);
    expect(overlapRatio('abc', '')).toBe(0);
  });
});
