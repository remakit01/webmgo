// Xếp hạng văn bản cho trợ lý AI (tra cứu kho kiến thức / bài cũ) — thuần TS, không phụ thuộc thư viện.
// - BM25 trên từ không dấu + cặp từ liền nhau (bigram) để ưu tiên khớp cụm ("ống gió" khác "gió ... ống").
// - cosine cho vector embedding, RRF để gộp nhiều bảng xếp hạng (từ khoá + ngữ nghĩa).

import { normalizeText } from './content-score.js';

/** Từ không dấu, chữ thường; bỏ từ 1 ký tự trừ khi là số (vd "6" trong "dày 6 mm") */
export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((w) => w.length >= 2 || /\d/.test(w));
}

/** Từ đơn + bigram (nối bằng "_") */
function terms(text: string): string[] {
  const words = tokenize(text);
  const out = [...words];
  for (let i = 0; i + 1 < words.length; i++) out.push(`${words[i]}_${words[i + 1]}`);
  return out;
}

export interface RankDoc {
  id: string;
  text: string;
}

export interface RankHit {
  id: string;
  score: number;
}

/** BM25 (k1 = 1.2, b = 0.75). Chỉ trả tài liệu có điểm > 0, giảm dần. */
export function bm25Rank(query: string, docs: RankDoc[], options: { k1?: number; b?: number } = {}): RankHit[] {
  const k1 = options.k1 ?? 1.2;
  const b = options.b ?? 0.75;
  const queryTerms = [...new Set(terms(query))];
  if (!queryTerms.length || !docs.length) return [];

  const docTerms = docs.map((d) => {
    const counts = new Map<string, number>();
    const list = terms(d.text);
    for (const t of list) counts.set(t, (counts.get(t) ?? 0) + 1);
    return { id: d.id, counts, length: list.length };
  });
  const avgLength = docTerms.reduce((sum, d) => sum + d.length, 0) / docTerms.length || 1;
  const df = new Map<string, number>();
  for (const t of queryTerms) df.set(t, docTerms.filter((d) => d.counts.has(t)).length);

  const n = docs.length;
  return docTerms
    .map((d) => {
      let score = 0;
      for (const t of queryTerms) {
        const tf = d.counts.get(t) ?? 0;
        if (!tf) continue;
        const idf = Math.log(1 + (n - df.get(t)! + 0.5) / (df.get(t)! + 0.5));
        score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.length) / avgLength));
      }
      return { id: d.id, score };
    })
    .filter((h) => h.score > 0)
    .sort((a, b2) => b2.score - a.score);
}

/** Độ tương đồng cosine của 2 vector cùng số chiều (0 nếu rỗng / khác chiều) */
export function cosine(a: readonly number[], b: readonly number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/**
 * Reciprocal Rank Fusion: gộp nhiều bảng xếp hạng (mỗi bảng là danh sách id theo thứ tự tốt -> kém).
 * score(id) = Σ 1 / (k + hạng). Bền với thang điểm khác nhau (BM25 vs cosine).
 */
export function rrfFuse(rankings: readonly (readonly string[])[], k = 60): RankHit[] {
  const scores = new Map<string, number>();
  for (const ranking of rankings) {
    ranking.forEach((id, i) => scores.set(id, (scores.get(id) ?? 0) + 1 / (k + i + 1)));
  }
  return [...scores.entries()].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
}

/** Chia văn bản thành đoạn ≤ maxChars, cắt theo dòng rồi theo câu (đoạn quá dài thì cắt cứng) */
export function chunkText(text: string, maxChars = 900): string[] {
  const pieces = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => (p.length <= maxChars ? [p] : (p.match(/[^.!?…]+[.!?…]*\s*/g) ?? [p])))
    .flatMap((p) => {
      const out: string[] = [];
      for (let i = 0; i < p.length; i += maxChars) out.push(p.slice(i, i + maxChars).trim());
      return out;
    })
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const piece of pieces) {
    if (current && current.length + piece.length + 1 > maxChars) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current}\n${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Mở rộng truy vấn bằng từ đồng nghĩa ngành: rules = { "ly": "mm", "gia": "don gia bao gia" } (khoá là từ không dấu).
 * Từ nào có trong truy vấn thì nối thêm phần mở rộng — giúp BM25 khớp cách viết khác ("12 ly" ~ "12 mm").
 */
export function expandQuery(text: string, rules: Readonly<Record<string, string>>): string {
  const words = new Set(tokenize(text));
  const extra = Object.entries(rules)
    .filter(([word]) => words.has(word))
    .map(([, expansion]) => expansion);
  return extra.length ? `${text}\n${extra.join(' ')}` : text;
}

/** Tỉ lệ từ trùng so với văn bản ngắn hơn (0–1) — lọc kiến thức đề xuất đã có trong kho */
export function overlapRatio(a: string, b: string): number {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / Math.min(A.size, B.size);
}
