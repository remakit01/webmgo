// Hợp đồng API "Viết cùng AI" (api/src/ai-writer <-> fe CMS). Mọi endpoint chỉ trả dữ liệu, KHÔNG ghi DB.
// Server không giữ trạng thái giữa các bước: CMS gửi lại kết quả nghiên cứu ở bước dàn ý / viết bài.

import type { RichNode } from '../rich-content.js';
import type { AiKnowledgeRef, AiKnowledgeSuggestion } from './ai-knowledge.js';

export const AI_WRITER_AUDIENCES = ['engineer', 'contractor', 'investor', 'architect'] as const;
export type AiWriterAudience = (typeof AI_WRITER_AUDIENCES)[number];

export const AI_WRITER_AUDIENCE_LABEL: Record<AiWriterAudience, string> = {
  engineer: 'Kỹ sư PCCC / M&E',
  contractor: 'Nhà thầu thi công',
  investor: 'Chủ đầu tư',
  architect: 'Kiến trúc sư / tư vấn thiết kế',
};

export const AI_WRITER_LENGTHS = ['short', 'medium', 'long'] as const;
export type AiWriterLength = (typeof AI_WRITER_LENGTHS)[number];

/** Số từ mục tiêu cả bài */
export const AI_WRITER_LENGTH_WORDS: Record<AiWriterLength, number> = { short: 600, medium: 1200, long: 2000 };

export const AI_WRITER_LIMITS = {
  keyword: 100,
  notes: 3000,
  secondaryKeywords: 10,
  researchText: 20_000,
  sources: 20,
  listItems: 15,
  itemLength: 300,
  sections: 12,
  pointsPerSection: 8,
  faq: 8,
  knowledgeIds: 30,
  articleIds: 10,
} as const;

/** Trang có thật trên site mà AI được phép chèn link (URL tiếng Việt — bài AI viết bằng tiếng Việt) */
export const SITE_LINK_TARGETS: { href: string; title: string }[] = [
  { href: '/san-pham', title: 'Sản phẩm tấm MGO FireOFF' },
  { href: '/giai-phap-ung-dung', title: 'Giải pháp ứng dụng (ống gió, vách ngăn, trần, sàn)' },
  { href: '/du-an', title: 'Dự án tiêu biểu' },
  { href: '/thu-vien-tai-lieu', title: 'Thư viện tài liệu, chứng nhận, báo cáo thử nghiệm' },
  { href: '/huong-dan-thi-cong', title: 'Hướng dẫn thi công' },
  { href: '/bao-gia', title: 'Báo giá' },
  { href: '/nhan-mau-thu', title: 'Nhận mẫu thử' },
  { href: '/dai-ly', title: 'Hệ thống đại lý' },
  { href: '/faq', title: 'Câu hỏi thường gặp' },
  { href: '/gioi-thieu', title: 'Giới thiệu Remak' },
];

export interface AiWriterSource {
  title: string;
  url: string;
}

// ─── B1: Nghiên cứu ─────────────────────────────────────────────────────────

export interface AiResearchRequest {
  keyword: string;
  secondaryKeywords?: string[];
  audience?: AiWriterAudience;
  notes?: string;
}

/** Bài đã có trên site trùng / gần trùng chủ đề */
export interface AiDuplicatePost {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export interface AiResearchResult {
  keyword: string;
  summary: string;
  keyPoints: string[];
  relatedKeywords: string[];
  /** Câu hỏi người đọc hay hỏi — chọn làm mục / FAQ */
  questions: string[];
  /** Câu hỏi liên quan mà công cụ tìm kiếm AI hay tự hỏi thêm (đo độ phủ GEO) */
  fanOutQueries: string[];
  /**
   * true = có tìm Google (nguồn web thật); false = Google Search không dùng được (hết quota, lỗi)
   * nên AI tổng hợp từ kiến thức của model — không có nguồn, số liệu cần kiểm chứng kỹ hơn
   */
  grounded: boolean;
  /** Tra cứu kho nội bộ: hybrid = từ khoá + ngữ nghĩa; keyword = chỉ từ khoá (embedding lỗi / chưa lập chỉ mục) */
  retrieval: 'hybrid' | 'keyword';
  /** Kiến thức nội bộ (kho "Kiến thức AI") AI dùng cho bài — biên tập viên bỏ tick được */
  knowledge: AiKnowledgeRef[];
  /** Bài đã đăng liên quan (tránh lặp ý, gợi ý link) */
  relatedArticles: { postId: string; title: string; slug: string }[];
  /** Kiến thức MỚI từ web (chỉ khi có Google Search) — chờ duyệt để lưu vào kho */
  knowledgeSuggestions: AiKnowledgeSuggestion[];
  /** Văn bản nghiên cứu gốc (có số trích dẫn [n] theo `sources`) — gửi lại ở bước dàn ý / viết */
  researchText: string;
  sources: AiWriterSource[];
  /** HTML "Search Suggestions" của Google — bắt buộc hiển thị (iframe sandbox) */
  searchEntryPointHtml: string | null;
  duplicates: AiDuplicatePost[];
}

export type AiResearchEvent =
  /** fallback: Google Search lỗi -> chuyển sang tổng hợp bằng kiến thức của model (message = lý do) */
  | { type: 'stage'; stage: 'knowledge' | 'searching' | 'fallback' | 'structuring' | 'checking'; message?: string }
  | { type: 'result'; research: AiResearchResult }
  | { type: 'error'; status: number; message: string };

// ─── B2: Dàn ý ──────────────────────────────────────────────────────────────

export interface AiOutlineSection {
  /** 2 = mục chính (H2), 3 = mục con (H3) */
  level: 2 | 3;
  heading: string;
  points: string[];
}

export interface AiOutlineRequest {
  keyword: string;
  audience?: AiWriterAudience;
  length: AiWriterLength;
  keyPoints: string[];
  questions: string[];
  researchText: string;
  sources: AiWriterSource[];
  notes?: string;
  /** Kiến thức nội bộ đã chọn — server tải lại nội dung theo id (không nhận văn bản từ client) */
  knowledgeIds?: string[];
  /** Bài đã đăng liên quan đã chọn */
  articleIds?: string[];
}

export interface AiOutline {
  titleOptions: string[];
  slug: string;
  sapo: string;
  /** Chuyên mục có sẵn AI đề xuất (null nếu không chọn được) */
  categoryId: string | null;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
  sections: AiOutlineSection[];
  faq: { question: string }[];
}

// ─── B3: Viết bài ───────────────────────────────────────────────────────────

export interface AiDraftRequest {
  keyword: string;
  audience?: AiWriterAudience;
  length: AiWriterLength;
  title: string;
  sapo: string;
  sections: AiOutlineSection[];
  faq: { question: string }[];
  researchText: string;
  sources: AiWriterSource[];
  notes?: string;
  knowledgeIds?: string[];
  articleIds?: string[];
  /** Để chấm điểm & tự sửa: ô SEO đang điền + câu hỏi fan-out của bước nghiên cứu */
  seoTitle?: string;
  seoDescription?: string;
  fanOutQueries?: string[];
}

/** Điểm phần nội dung (0–100) */
export interface AiQualityScores {
  seo: number;
  aeo: number;
  geo: number;
}

/** Link nội bộ AI đã chèn — CMS liệt kê để biên tập viên giữ / gỡ */
export interface AiLinkSuggestion {
  href: string;
  anchorText: string;
  /** Mục chứa link (index trong sections; -1 = hộp tóm tắt, -2 = FAQ) */
  sectionIndex: number;
  /** Tên trang / bài đích */
  title: string;
}

export type AiDraftEvent =
  | { type: 'start'; total: number }
  /** Hộp "Tóm tắt nhanh" — chèn đầu bài */
  | { type: 'summary'; nodes: RichNode[] }
  /** Một mục đã viết xong (gồm cả tiêu đề mục) — chèn theo đúng index của dàn ý */
  | { type: 'section'; index: number; total: number; nodes: RichNode[] }
  | { type: 'faq'; nodes: RichNode[] }
  | { type: 'references'; nodes: RichNode[] }
  /** Chấm điểm sau khi viết; mục chưa đạt đã được AI sửa 1 lượt (fixes rỗng = không cần / không cải thiện được) */
  | { type: 'quality'; before: AiQualityScores; after: AiQualityScores; fixes: string[] }
  | { type: 'result'; linkSuggestions: AiLinkSuggestion[]; warnings: string[] }
  | { type: 'error'; status: number; message: string };
