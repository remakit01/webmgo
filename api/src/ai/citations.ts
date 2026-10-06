// Gắn số trích dẫn [n] vào văn bản Gemini trả về khi dùng Google Search (groundingSupports).
// Nhờ đó bước viết bài / đề xuất kiến thức biết chính xác ý nào lấy từ nguồn nào — AI không phải tự đoán nguồn.

export interface CitationSupport {
  segment?: { partIndex?: number; endIndex?: number; text?: string };
  groundingChunkIndices?: number[];
}

/**
 * parts: văn bản từng Part của câu trả lời; chunkToSource[i] = số thứ tự nguồn (1-based) của groundingChunk i, 0 nếu bỏ.
 * Offset của Gemini tính theo BYTE UTF-8 trong từng Part (tiếng Việt có dấu nhiều byte) -> chèn trên Buffer.
 */
export function addCitationMarkers(parts: string[], supports: CitationSupport[], chunkToSource: number[]): string {
  const inserts = new Map<number, Map<number, Set<number>>>(); // partIndex -> byteOffset -> các số nguồn
  for (const s of supports) {
    const end = s.segment?.endIndex;
    const part = s.segment?.partIndex ?? 0;
    if (end === undefined || !parts[part]) continue;
    const numbers = (s.groundingChunkIndices ?? []).map((i) => chunkToSource[i]).filter((n): n is number => !!n);
    if (!numbers.length) continue;
    const byPart = inserts.get(part) ?? new Map<number, Set<number>>();
    const set = byPart.get(end) ?? new Set<number>();
    numbers.forEach((n) => set.add(n));
    byPart.set(end, set);
    inserts.set(part, byPart);
  }
  return parts
    .map((text, partIndex) => {
      const byPart = inserts.get(partIndex);
      if (!byPart) return text;
      let buf = Buffer.from(text, 'utf8');
      // Chèn từ cuối lên đầu để offset phía trước không lệch
      for (const [offset, numbers] of [...byPart.entries()].sort((a, b) => b[0] - a[0])) {
        if (offset < 0 || offset > buf.length) continue;
        const marker = Buffer.from(` ${[...numbers].sort((a, b) => a - b).map((n) => `[${n}]`).join('')}`, 'utf8');
        buf = Buffer.concat([buf.subarray(0, offset), marker, buf.subarray(offset)]);
      }
      return buf.toString('utf8');
    })
    .join('');
}
