import { addCitationMarkers } from './citations.js';

const bytes = (s: string) => Buffer.byteLength(s, 'utf8');

describe('addCitationMarkers', () => {
  it('chèn [n] đúng vị trí theo byte (tiếng Việt có dấu)', () => {
    const a = 'Tấm MGO chịu lửa EI 60.';
    const b = ' Theo QCVN 06:2022/BXD.';
    const text = a + b;
    const out = addCitationMarkers(
      [text],
      [
        { segment: { endIndex: bytes(a) }, groundingChunkIndices: [0] },
        { segment: { endIndex: bytes(text) }, groundingChunkIndices: [1, 2] },
      ],
      [1, 2, 2],
    );
    expect(out).toBe('Tấm MGO chịu lửa EI 60. [1] Theo QCVN 06:2022/BXD. [2]');
  });

  it('bỏ chunk không có nguồn, segment thiếu offset; nhiều part', () => {
    const out = addCitationMarkers(
      ['Một.', ' Hai.'],
      [
        { segment: { partIndex: 1, endIndex: bytes(' Hai.') }, groundingChunkIndices: [0, 1] },
        { segment: {}, groundingChunkIndices: [0] },
        { segment: { endIndex: 4 }, groundingChunkIndices: [1] },
      ],
      [3, 0],
    );
    expect(out).toBe('Một. Hai. [3]');
  });
});
