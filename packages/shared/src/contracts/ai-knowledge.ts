// Hợp đồng API kho "Kiến thức AI" (api/src/ai-knowledge <-> fe CMS /admin/ai-knowledge).

export const AI_KNOWLEDGE_KINDS = ['PRODUCT', 'SPEC', 'CERTIFICATION', 'APPLICATION', 'PROJECT', 'FAQ', 'PROCESS', 'COMPANY', 'MARKET', 'OTHER'] as const;
export type AiKnowledgeKind = (typeof AI_KNOWLEDGE_KINDS)[number];

export const AI_KNOWLEDGE_KIND_LABEL: Record<AiKnowledgeKind, string> = {
  PRODUCT: 'Sản phẩm',
  SPEC: 'Thông số kỹ thuật',
  CERTIFICATION: 'Chứng nhận / thử nghiệm',
  APPLICATION: 'Giải pháp ứng dụng',
  PROJECT: 'Dự án',
  FAQ: 'Hỏi đáp',
  PROCESS: 'Quy trình / thi công',
  COMPANY: 'Thông tin công ty',
  MARKET: 'Thị trường / tiêu chuẩn mới',
  OTHER: 'Khác',
};

export const AI_KNOWLEDGE_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;
export type AiKnowledgeStatus = (typeof AI_KNOWLEDGE_STATUSES)[number];

export const AI_KNOWLEDGE_ORIGINS = ['SEED', 'HUMAN', 'AI_WEB'] as const;
export type AiKnowledgeOrigin = (typeof AI_KNOWLEDGE_ORIGINS)[number];

export const AI_KNOWLEDGE_ORIGIN_LABEL: Record<AiKnowledgeOrigin, string> = {
  SEED: 'Nạp sẵn',
  HUMAN: 'Biên tập',
  AI_WEB: 'Từ web (đã duyệt)',
};

export const AI_KNOWLEDGE_LIMITS = { title: 200, content: 4000, tags: 15, tag: 50, sourceUrl: 2000 } as const;

export interface AiKnowledgeItem {
  id: string;
  kind: AiKnowledgeKind;
  title: string;
  content: string;
  tags: string[];
  sourceUrl: string | null;
  sourceTitle: string | null;
  status: AiKnowledgeStatus;
  origin: AiKnowledgeOrigin;
  pinned: boolean;
  verifiedAt: string | null;
  /** Đã có embedding cho nội dung hiện tại (tìm theo ngữ nghĩa được) */
  indexed: boolean;
  createdAt: string;
  updatedAt: string;
  /** Phiên bản cho If-Match */
  version: string;
}

export interface AiKnowledgeInput {
  kind: AiKnowledgeKind;
  title: string;
  content: string;
  tags?: string[];
  sourceUrl?: string | null;
  sourceTitle?: string | null;
  pinned?: boolean;
  status?: AiKnowledgeStatus;
}

export interface AiKnowledgeListQuery {
  q?: string;
  kind?: AiKnowledgeKind;
  status?: AiKnowledgeStatus;
  origin?: AiKnowledgeOrigin;
  page?: number;
  pageSize?: number;
}

export interface AiKnowledgeStats {
  total: number;
  active: number;
  indexed: number;
  /** Model embedding đang dùng */
  embeddingModel: string;
}

/** Mẩu kiến thức AI đã dùng khi viết (hiển thị trong panel) */
export interface AiKnowledgeRef {
  id: string;
  kind: AiKnowledgeKind;
  title: string;
  pinned: boolean;
}

/** Kiến thức mới AI tìm được trên web — chờ biên tập viên duyệt mới lưu vào kho */
export interface AiKnowledgeSuggestion {
  kind: AiKnowledgeKind;
  title: string;
  content: string;
  sourceUrl: string;
  sourceTitle: string;
}

/** Kết quả tra cứu (thử trong CMS / ngữ cảnh AI viết bài) */
export interface AiRetrieveResult {
  /** hybrid = từ khoá + ngữ nghĩa; keyword = embedding không dùng được */
  mode: 'hybrid' | 'keyword';
  facts: { id: string; kind: AiKnowledgeKind; title: string; content: string; sourceUrl: string | null; pinned: boolean }[];
  articles: { postId: string; title: string; slug: string; excerpt: string }[];
}

export interface AiReindexResult {
  embedded: number;
  skipped: number;
  removed: number;
  failed: number;
}
