import {
  AI_WRITER_AUDIENCE_LABEL,
  AI_WRITER_LENGTH_WORDS,
  type AiOutlineSection,
  type AiWriterAudience,
  type AiWriterLength,
  type AiWriterSource,
} from '@remak/shared/contracts/ai-writer';
import { AI_KNOWLEDGE_KIND_LABEL, type AiKnowledgeKind } from '@remak/shared/contracts/ai-knowledge';
import { VERIFY_MARK } from '@remak/shared/content-score';
import { GLOSSARY_VI_EN, KEEP_AS_IS } from '../translation/glossary.js';

// Prompt cho trợ lý viết bài Tin tức. Nội dung kỹ thuật PCCC: sai số liệu/tiêu chuẩn là lỗi nghiêm trọng,
// nên mọi prompt viết đều kèm quy tắc chống bịa và đánh dấu [cần kiểm chứng] khi thiếu nguồn.

// Một nguồn duy nhất với bảng chấm điểm (content-score: mục geo-verify-marks)
export { VERIFY_MARK };

const audienceLine = (audience?: AiWriterAudience) =>
  audience ? `Người đọc chính: ${AI_WRITER_AUDIENCE_LABEL[audience]}.` : 'Người đọc: kỹ sư, nhà thầu và chủ đầu tư công trình.';

const TERMS = `Thuật ngữ chuẩn (dùng thống nhất): ${GLOSSARY_VI_EN.map(([vi]) => vi).join(', ')}. Giữ nguyên, không dịch/không đổi cách viết: ${KEEP_AS_IS.join(', ')}.`;

const BRAND = 'Remak® là nhà sản xuất tấm chống cháy Magie Oxit (MGO) thương hiệu FireOFF tại Việt Nam.';

const FACT_RULES = `Quy tắc chính xác (bắt buộc):
- Chỉ dùng số liệu, tên tiêu chuẩn (QCVN, TCVN, EN, ASTM...), kết quả thử nghiệm, tên tổ chức có trong KIẾN THỨC NỘI BỘ REMAK hoặc TÀI LIỆU NGHIÊN CỨU bên dưới. Không tự nghĩ ra số liệu.
- Thiếu dữ liệu thì viết chung chung, hoặc giữ ý và ghi ${VERIFY_MARK} ngay sau câu đó.
- KHÔNG bịa lời trích dẫn của người thật, chuyên gia, kỹ sư hay khách hàng.
- Thông tin về sản phẩm Remak® (thành phần, độ dày, tỷ trọng, cấp chịu lửa, giá, chứng nhận) CHỈ lấy từ KIẾN THỨC NỘI BỘ REMAK hoặc ghi chú của biên tập viên — trích đúng con số, không làm tròn, không suy diễn. Thông số có trong kiến thức nội bộ thì KHÔNG gắn ${VERIFY_MARK}; không có thì không khẳng định và ghi ${VERIFY_MARK}.
- Kiến thức nội bộ mâu thuẫn với nguồn web: về sản phẩm Remak theo kiến thức nội bộ; về tiêu chuẩn / quy định chung thì theo nguồn chính thống mới hơn và nói rõ.
- Giá trong kiến thức nội bộ là giá tham khảo: chỉ nêu khi bài cần, kèm chữ "tham khảo" và khuyên liên hệ báo giá.
- Không nói xấu, không đưa thông tin sai về đối thủ; không quảng cáo quá đà ("tốt nhất", "số 1") khi không có nguồn.`;

const STYLE_RULES = `Văn phong: báo chí kỹ thuật tiếng Việt, câu rõ ràng, chủ động, không sáo rỗng; mỗi đoạn một ý, tối đa ~100 từ.
Không nhồi keyword: dùng keyword chính tự nhiên, xen từ đồng nghĩa.`;

const INLINE_RULES = `Định dạng chữ trong "text"/"items"/"rows": chỉ dùng thẻ <b>…</b>, <i>…</i>, <a href="…">…</a>. KHÔNG dùng Markdown (**, #, -, [](...)).
Ký tự < > & trong nội dung viết dạng &lt; &gt; &amp;.`;

/** Khối "bài mẫu điểm cao" — chỉ học cấu trúc / cách mở đầu mục, không chép nội dung */
const exemplarBlock = (exemplars?: string) =>
  exemplars ? `BÀI MẪU ĐIỂM CAO TRÊN SITE (chỉ học cấu trúc, cách mở đầu mục bằng câu trả lời; KHÔNG chép nội dung):\n${exemplars}\n\n` : '';

const sourcesBlock = (sources: AiWriterSource[]) =>
  sources.length ? sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join('\n') : '(không có)';

// ─── B1: Nghiên cứu ─────────────────────────────────────────────────────────

export const RESEARCH_SYSTEM = `Bạn là biên tập viên nghiên cứu cho website kỹ thuật về vật liệu chống cháy. ${BRAND}
Hãy tìm trên Google rồi tổng hợp bằng tiếng Việt, khách quan, có dẫn nguồn. Ưu tiên nguồn chính thống: văn bản pháp luật, Bộ Xây dựng, Cục Cảnh sát PCCC, viện thử nghiệm (IBST...), tiêu chuẩn quốc tế, nhà sản xuất.`;

/** Dự phòng khi Google Search không dùng được: tổng hợp từ kiến thức của model, không có nguồn web */
export const RESEARCH_MODEL_SYSTEM = `Bạn là biên tập viên nghiên cứu cho website kỹ thuật về vật liệu chống cháy. ${BRAND}
Lần này KHÔNG có công cụ tìm kiếm: chỉ tổng hợp từ kiến thức sẵn có, bằng tiếng Việt, khách quan.
- KHÔNG bịa URL, tên bài báo, tên tài liệu hay lời trích dẫn.
- Mọi con số, thông số, năm ban hành, điều khoản tiêu chuẩn mà bạn không chắc chắn: ghi ${VERIFY_MARK} ngay sau.
- Không biết thì nói không rõ, không đoán.
- Thông số, chứng nhận, giá của sản phẩm Remak® CHỈ lấy từ khối KIẾN THỨC NỘI BỘ REMAK (nếu có) — trích đúng; ngoài khối đó không khẳng định gì về sản phẩm Remak.`;

/** Đầu văn bản nghiên cứu khi không có Google Search — đi kèm sang bước dàn ý / viết bài */
export const MODEL_ONLY_RESEARCH_HEADER =
  '(Ghi chú tổng hợp từ kiến thức của AI, KHÔNG có nguồn web — mọi số liệu, tiêu chuẩn cần kiểm chứng trước khi đăng.)';

/** Kiến thức nội bộ đưa vào prompt (từ kho "Kiến thức AI" + bài đã đăng) */
export interface InternalKnowledge {
  facts: { title: string; kind: AiKnowledgeKind; content: string; sourceUrl: string | null }[];
  articles: { title: string; slug: string; excerpt: string }[];
}

/** Khối "KIẾN THỨC NỘI BỘ REMAK" + "BÀI ĐÃ ĐĂNG" — rỗng nếu không có gì */
export function knowledgeBlock(k?: InternalKnowledge | null): string {
  if (!k || (!k.facts.length && !k.articles.length)) return '';
  const facts = k.facts.length
    ? `KIẾN THỨC NỘI BỘ REMAK (đã kiểm chứng — nguồn đúng nhất về sản phẩm, trích đúng số liệu):
${k.facts.map((f, i) => `[K${i + 1}] (${AI_KNOWLEDGE_KIND_LABEL[f.kind]}) ${f.title}${f.sourceUrl ? ` — trang: ${f.sourceUrl}` : ''}\n${f.content}`).join('\n\n')}`
    : '';
  const articles = k.articles.length
    ? `BÀI ĐÃ ĐĂNG TRÊN SITE (để không lặp ý; có thể đặt link /tin-tuc/<slug> khi liên quan):
${k.articles.map((a) => `- ${a.title} (/tin-tuc/${a.slug}): ${a.excerpt.replace(/\s+/g, ' ').slice(0, 300)}`).join('\n')}`
    : '';
  return [facts, articles].filter(Boolean).join('\n\n');
}

export function researchPrompt(input: {
  keyword: string;
  secondaryKeywords?: string[];
  audience?: AiWriterAudience;
  notes?: string;
  knowledge?: InternalKnowledge | null;
}) {
  const internal = knowledgeBlock(input.knowledge);
  return `Nghiên cứu chủ đề cho một bài viết: "${input.keyword}".
${input.secondaryKeywords?.length ? `Keyword phụ: ${input.secondaryKeywords.join(', ')}.` : ''}
${audienceLine(input.audience)}
${input.notes ? `Ghi chú của biên tập viên:\n${input.notes}\n` : ''}
${internal ? `${internal}\n\nKiến thức nội bộ ở trên là dữ liệu chuẩn của Remak — đối chiếu, KHÔNG cần tìm lại. Ưu tiên tìm thông tin MỚI chưa có ở trên (tiêu chuẩn, quy định, số liệu thị trường, công nghệ, câu hỏi người dùng) và ghi rõ nếu mâu thuẫn.\n` : ''}
Tổng hợp:
1. Định nghĩa / bối cảnh của chủ đề.
2. Số liệu, thông số kỹ thuật, yêu cầu tiêu chuẩn liên quan (ghi rõ nguồn của từng con số).
3. Các câu hỏi người tìm kiếm hay đặt quanh chủ đề và câu trả lời ngắn.
4. Điểm khác biệt / so sánh / sai lầm thường gặp (nếu có).
Viết dạng gạch đầu dòng ngắn gọn, mỗi ý có dẫn nguồn (nếu có).`;
}

export const STRUCTURE_SYSTEM = `Bạn chuyển ghi chú nghiên cứu thành dữ liệu có cấu trúc cho trợ lý viết bài. ${BRAND}
Chỉ dùng thông tin có trong ghi chú. Trả lời bằng tiếng Việt, đúng JSON schema.`;

export function structurePrompt(
  keyword: string,
  researchText: string,
  extra: { knowledge?: InternalKnowledge | null; sources?: AiWriterSource[] } = {},
) {
  const internal = knowledgeBlock(extra.knowledge);
  const learn = extra.sources?.length
    ? `
- newFacts: 0–6 thông tin MỚI có trong ghi chú nghiên cứu (đã gắn số nguồn [n]) nhưng CHƯA có trong kiến thức nội bộ, đáng lưu lâu dài cho các bài sau (tiêu chuẩn / quy định mới, số liệu thị trường, công nghệ, quy trình). Mỗi mục: kind (MARKET | SPEC | CERTIFICATION | PROCESS | OTHER), title ngắn ≤ 120 ký tự, content 1–4 câu giữ nguyên số liệu, sourceIndex = số [n] của nguồn chứa thông tin đó. KHÔNG đưa thông số sản phẩm Remak, không đưa ý chung chung, không đưa ý không có số [n].`
    : '';
  return `Keyword chính: "${keyword}"
${internal ? `\n${internal}\n` : ''}
GHI CHÚ NGHIÊN CỨU:
${researchText}
${extra.sources?.length ? `\nNGUỒN:\n${sourcesBlock(extra.sources)}\n` : ''}
Trả về:
- summary: tóm tắt 2–3 câu.
- keyPoints: 5–10 ý chính nên có trong bài (mỗi ý một câu, giữ số liệu kèm nguồn nếu có).
- relatedKeywords: 5–10 keyword phụ / cụm từ liên quan người dùng hay tìm (ngắn, viết thường).
- questions: 5–10 câu hỏi người đọc hay hỏi (dạng câu hỏi tự nhiên, có dấu ?).
- fanOutQueries: 5–10 truy vấn liên quan mà công cụ tìm kiếm AI (Google AI Overviews, ChatGPT) thường tự tìm thêm khi trả lời keyword này.${learn}`;
}

export const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    relatedKeywords: { type: 'array', items: { type: 'string' } },
    questions: { type: 'array', items: { type: 'string' } },
    fanOutQueries: { type: 'array', items: { type: 'string' } },
    newFacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['MARKET', 'SPEC', 'CERTIFICATION', 'PROCESS', 'OTHER'] },
          title: { type: 'string' },
          content: { type: 'string' },
          sourceIndex: { type: 'integer' },
        },
        required: ['kind', 'title', 'content', 'sourceIndex'],
      },
    },
  },
  required: ['summary', 'keyPoints', 'relatedKeywords', 'questions', 'fanOutQueries'],
} as const;

// ─── B2: Dàn ý ──────────────────────────────────────────────────────────────

export const OUTLINE_SYSTEM = `Bạn là biên tập viên SEO cho website kỹ thuật về tấm chống cháy MGO. ${BRAND}
Lập dàn ý bài viết tối ưu SEO (Google), AEO (được chọn làm câu trả lời trực tiếp) và GEO (được ChatGPT/Gemini/Perplexity trích dẫn):
- Tiêu đề mục H2/H3 viết theo cách người dùng đặt câu hỏi khi phù hợp ("… là gì?", "… như thế nào?", "… bao nhiêu?").
- Chủ đề "X là gì" có mục định nghĩa ở đầu; chủ đề "X và Y" có mục so sánh (bảng); quy trình có mục các bước.
- Bao phủ các câu hỏi liên quan để trả lời trọn chủ đề.
${TERMS}
${FACT_RULES}
Trả lời bằng tiếng Việt, đúng JSON schema.`;

export function outlinePrompt(input: {
  keyword: string;
  audience?: AiWriterAudience;
  length: AiWriterLength;
  keyPoints: string[];
  questions: string[];
  researchText: string;
  notes?: string;
  categories: { id: string; name: string }[];
  knowledge?: InternalKnowledge | null;
  exemplars?: string;
}) {
  const words = AI_WRITER_LENGTH_WORDS[input.length];
  const internal = knowledgeBlock(input.knowledge);
  return `Keyword chính: "${input.keyword}". ${audienceLine(input.audience)}
Độ dài bài: khoảng ${words} từ (khoảng ${Math.max(3, Math.round(words / 250))} mục H2).
${input.notes ? `Ghi chú của biên tập viên:\n${input.notes}\n` : ''}
Ý chính phải có:
${input.keyPoints.map((p) => `- ${p}`).join('\n') || '(tự chọn từ nghiên cứu)'}

Câu hỏi đã chọn (dùng làm mục hoặc FAQ):
${input.questions.map((q) => `- ${q}`).join('\n') || '(tự chọn từ nghiên cứu)'}

Chuyên mục có sẵn (chọn đúng một id, hoặc chuỗi rỗng nếu không hợp):
${input.categories.map((c) => `- ${c.id}: ${c.name}`).join('\n')}

${internal ? `${internal}\n\n` : ''}${exemplarBlock(input.exemplars)}TÀI LIỆU NGHIÊN CỨU:
${input.researchText}

Trả về:
- titleOptions: 3 tiêu đề khác nhau, 50–70 ký tự, chứa keyword chính tự nhiên (ưu tiên gần đầu).
- slug: đường dẫn không dấu, nối bằng "-", chứa keyword, tối đa 70 ký tự.
- sapo: 40–60 từ, câu đầu trả lời thẳng câu hỏi chính của keyword.
- categoryId: id chuyên mục phù hợp nhất.
- seoTitle: 30–60 ký tự. seoDescription: 120–160 ký tự, chứa keyword.
- coverAlt: mô tả ảnh đại diện gợi ý (≤ 125 ký tự).
- sections: danh sách mục theo thứ tự; level 2 = H2, level 3 = H3 thuộc H2 ngay trước; mỗi mục có 2–5 ý (points) cần viết. Không đưa mục "Kết luận"/"FAQ"/"Tài liệu tham khảo" vào đây.
- faq: 3–6 câu hỏi cho khối FAQ cuối bài (không trùng tiêu đề mục).`;
}

export const OUTLINE_SCHEMA = {
  type: 'object',
  properties: {
    titleOptions: { type: 'array', items: { type: 'string' } },
    slug: { type: 'string' },
    sapo: { type: 'string' },
    categoryId: { type: 'string' },
    seoTitle: { type: 'string' },
    seoDescription: { type: 'string' },
    coverAlt: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          level: { type: 'integer', enum: [2, 3] },
          heading: { type: 'string' },
          points: { type: 'array', items: { type: 'string' } },
        },
        required: ['level', 'heading', 'points'],
      },
    },
    faq: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] } },
  },
  required: ['titleOptions', 'slug', 'sapo', 'categoryId', 'seoTitle', 'seoDescription', 'coverAlt', 'sections', 'faq'],
} as const;

// ─── B3: Viết bài ───────────────────────────────────────────────────────────

export const WRITER_SYSTEM = `Bạn là kỹ sư kiêm biên tập viên viết bài kỹ thuật cho website của Remak. ${BRAND}
${STYLE_RULES}
${TERMS}
${FACT_RULES}
${INLINE_RULES}
Trả lời đúng JSON schema: { "blocks": [...] } với các khối heading | paragraph | bullets | numbered | quote | callout | table.`;

export interface DraftContext {
  keyword: string;
  audience?: AiWriterAudience;
  length: AiWriterLength;
  title: string;
  sapo: string;
  sections: AiOutlineSection[];
  researchText: string;
  sources: AiWriterSource[];
  notes?: string;
  /** Link nội bộ được phép */
  links: { href: string; title: string }[];
  knowledge?: InternalKnowledge | null;
  /** Khung 1–2 bài đã đăng điểm cao (học cấu trúc / văn phong) */
  exemplars?: string;
}

const outlineBlock = (sections: AiOutlineSection[], current?: number) =>
  sections.map((s, i) => `${i === current ? '>> ' : ''}${s.level === 2 ? 'H2' : '   H3'}: ${s.heading}`).join('\n');

const sharedContext = (ctx: DraftContext) => `Bài viết: "${ctx.title}"
Keyword chính: "${ctx.keyword}". ${audienceLine(ctx.audience)}
Sapo: ${ctx.sapo}
${ctx.notes ? `Ghi chú của biên tập viên:\n${ctx.notes}\n` : ''}
DÀN Ý CẢ BÀI:
${outlineBlock(ctx.sections)}
${knowledgeBlock(ctx.knowledge) ? `\n${knowledgeBlock(ctx.knowledge)}\n` : ''}
${exemplarBlock(ctx.exemplars)}TÀI LIỆU NGHIÊN CỨU:
${ctx.researchText}

NGUỒN (được phép đặt link <a href> tới đúng các URL này khi dẫn số liệu):
${sourcesBlock(ctx.sources)}

LINK NỘI BỘ ĐƯỢC PHÉP (chèn tự nhiên 0–2 link khi thật sự liên quan, ưu tiên trang sản phẩm / giải pháp của kiến thức nội bộ đã dùng; mọi href khác sẽ bị xoá):
${ctx.links.map((l) => `- ${l.href} — ${l.title}`).join('\n')}`;

/** Số từ mục tiêu cho một mục (chia đều độ dài bài cho các mục, H3 ngắn hơn) */
export function sectionWords(ctx: DraftContext, index: number) {
  const total = AI_WRITER_LENGTH_WORDS[ctx.length];
  const weight = ctx.sections.reduce((sum, s) => sum + (s.level === 2 ? 2 : 1), 0) || 1;
  const own = ctx.sections[index].level === 2 ? 2 : 1;
  return Math.max(80, Math.round(((total * 0.85) / weight) * own));
}

export function sectionPrompt(ctx: DraftContext, index: number) {
  const s = ctx.sections[index];
  return `${sharedContext(ctx)}

NHIỆM VỤ: viết nội dung cho mục ${s.level === 2 ? 'H2' : 'H3'} "${s.heading}" (đánh dấu >> trong dàn ý), khoảng ${sectionWords(ctx, index)} từ.
Ý cần viết:
${s.points.map((p) => `- ${p}`).join('\n') || '- (tự triển khai theo tiêu đề mục)'}

Yêu cầu:
- KHÔNG lặp lại tiêu đề mục (hệ thống tự chèn). Khối đầu tiên là đoạn văn 40–60 từ trả lời thẳng câu hỏi của tiêu đề mục, rồi mới giải thích.
- Chỉ viết phần của mục này, không viết sang mục khác, không viết kết luận cả bài.
- Quy trình dùng "numbered"; liệt kê dùng "bullets"; so sánh nhiều tiêu chí dùng "table" (hàng đầu là tiêu đề cột).
- Có thể dùng heading level 4 nếu cần chia nhỏ (mục H2 có thể dùng level 3).
- Có thể dùng một "callout" (variant tip hoặc warning) cho lưu ý thi công quan trọng.
- KHÔNG dùng "quote" để giả làm lời chuyên gia.`;
}

/** Viết lại một mục đã có theo danh sách việc cần sửa (vòng tự sửa chất lượng) */
export function revisePrompt(ctx: DraftContext, index: number, current: string, instructions: { text: string }[]) {
  return `${sectionPrompt(ctx, index)}

BẢN ĐANG CÓ CỦA MỤC (viết lại TOÀN BỘ mục, giữ các ý và số liệu đúng, không thêm thông tin không có nguồn):
${current}

YÊU CẦU SỬA (bắt buộc):
${instructions.map((i) => `- ${i.text}`).join('\n')}`;
}

export function summaryPrompt(ctx: DraftContext) {
  return `${sharedContext(ctx)}

NHIỆM VỤ: viết hộp "Tóm tắt nhanh" đặt đầu bài: 3–5 ý, mỗi ý một câu ngắn (≤ 25 từ), ý đầu trả lời thẳng câu hỏi chính của keyword.
Trả về JSON { "items": [...] } — mỗi phần tử là một ý.`;
}

/** Schema riêng cho hộp tóm tắt — đơn giản để model nhỏ (Flash Lite) không nhầm sang các khối khác */
export const SUMMARY_SCHEMA = {
  type: 'object',
  properties: { items: { type: 'array', items: { type: 'string' } } },
  required: ['items'],
} as const;

export function faqPrompt(ctx: DraftContext, questions: string[]) {
  return `${sharedContext(ctx)}

NHIỆM VỤ: trả lời các câu hỏi FAQ cuối bài, mỗi câu 40–80 từ, câu đầu trả lời thẳng, không lặp nguyên văn nội dung các mục.
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
}

export const FAQ_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } }, required: ['question', 'answer'] },
    },
  },
  required: ['items'],
} as const;

export const REFERENCES_HEADING = 'Tài liệu tham khảo';
