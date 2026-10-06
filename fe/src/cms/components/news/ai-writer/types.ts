import type { RichDoc } from '@remak/shared/rich-content';

/** Ô của bản tiếng Việt mà AI được điền */
export const AI_FILL_FIELDS = ['title', 'sapo', 'focusKeyword', 'seoTitle', 'seoDescription', 'coverAlt'] as const;
export type AiFillField = (typeof AI_FILL_FIELDS)[number];
export type AiFillPatch = Partial<Record<AiFillField, string>>;

export const AI_FIELD_LABEL: Record<AiFillField, string> = {
  title: 'Tiêu đề',
  sapo: 'Sapo',
  focusKeyword: 'Keyword chính',
  seoTitle: 'Tiêu đề SEO',
  seoDescription: 'Mô tả SEO',
  coverAlt: 'Mô tả ảnh đại diện (alt)',
};

/**
 * Cầu nối panel "Viết cùng AI" -> form NewsEditor. AI không bao giờ tự lưu / xuất bản;
 * ô người dùng đã tự nhập thì không ghi đè (trả về danh sách ô bị bỏ qua để panel hiện "Dùng đề xuất AI").
 */
export interface AiWriterHost {
  /** Keyword chính đang có trên form (điền sẵn ô keyword của panel) */
  initialKeyword: string;
  categories: { id: string; name: string }[];
  /** force = người dùng chủ động chọn đề xuất AI (vd đổi phương án tiêu đề) */
  fill: (patch: AiFillPatch, options?: { force?: boolean }) => AiFillField[];
  /** false = người dùng đã tự chọn chuyên mục khác, không đổi */
  setCategory: (id: string, options?: { force?: boolean }) => boolean;
  /** Gắn tag theo tên (khớp tag có sẵn, chưa có thì tạo) — trả số tag mới gắn */
  addTags: (names: string[]) => Promise<number>;
  /** Hỏi trước khi thay nội dung editor đang có chữ */
  confirmReplaceContent: () => Promise<boolean>;
  /** Thay nội dung bài tiếng Việt (đánh dấu nguồn AI) */
  setContent: (doc: RichDoc) => void;
  getContent: () => RichDoc;
  /** Khoá editor trong lúc AI đang chèn nội dung */
  setWriting: (writing: boolean) => void;
  /** Câu hỏi fan-out từ bước nghiên cứu -> điểm GEO "độ phủ" */
  setFanOut: (queries: string[]) => void;
}
