import { createHash } from 'node:crypto';
import { chunkText } from '@remak/shared/text-rank';

// Cách dựng văn bản & chia đoạn cho embedding / tìm từ khoá — dùng chung cho AiIndexService và AiRetrieverService
// (hai bên phải chia giống hệt nhau để so textHash).

export const SOURCE_KNOWLEDGE = 'knowledge';
export const SOURCE_NEWS = 'news';
export type EmbeddingSource = typeof SOURCE_KNOWLEDGE | typeof SOURCE_NEWS;

export const CHUNK_CHARS = 900;

/** Từ đồng nghĩa ngành (khoá không dấu) — mở rộng truy vấn tra cứu kiến thức */
export const DOMAIN_SYNONYMS: Readonly<Record<string, string>> = {
  ly: 'mm do day',
  li: 'mm do day',
  gia: 'don gia bao gia gia tham khao',
  pccc: 'phong chay chua chay chong chay',
  mgo: 'magie oxit magnesium',
  ei: 'gioi han chiu lua',
  dot: 'thu nghiem bien ban IBST',
  ibst: 'thu nghiem bien ban dot lo',
  san: 'lot san chiu tai',
  vach: 'vach ngan',
};

export const textHash = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 20);

export interface KnowledgeTextInput {
  title: string;
  content: string;
  tags: string[];
}

/** Văn bản một mẩu kiến thức (tiêu đề + nội dung + tag) */
export const knowledgeText = (k: KnowledgeTextInput) => `${k.title}\n${k.content}${k.tags.length ? `\nTag: ${k.tags.join(', ')}` : ''}`;

export const knowledgeChunks = (k: KnowledgeTextInput) => chunkText(knowledgeText(k), CHUNK_CHARS);

export interface NewsTextInput {
  title: string;
  sapo: string;
  contentText: string;
}

/** Đoạn của một bài Tin tức — mỗi đoạn kèm tiêu đề bài để giữ ngữ cảnh */
export const newsChunks = (n: NewsTextInput) =>
  chunkText(`${n.sapo}\n${n.contentText}`, CHUNK_CHARS).map((chunk) => `${n.title}\n${chunk}`);
