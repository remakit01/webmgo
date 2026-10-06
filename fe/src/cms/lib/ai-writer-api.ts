import type {
  AiDraftEvent,
  AiDraftRequest,
  AiOutline,
  AiOutlineRequest,
  AiResearchEvent,
  AiResearchRequest,
} from '@remak/shared/contracts/ai-writer';
import { apiFetch, apiStreamNdjson } from './api-client';

// Trợ lý "Viết cùng AI" (api/src/ai-writer) — chỉ trả dữ liệu, không lưu gì
export const aiWriterApi = {
  /** Nghiên cứu keyword (Google, tự chuyển sang kiến thức model khi Search lỗi) — NDJSON */
  research: (body: AiResearchRequest, onEvent: (event: AiResearchEvent) => void, signal?: AbortSignal) =>
    apiStreamNdjson<AiResearchEvent>('/ai-writer/news/research/stream', onEvent, signal, body),
  outline: (body: AiOutlineRequest, signal?: AbortSignal) =>
    apiFetch<AiOutline>('/ai-writer/news/outline', { method: 'POST', body: JSON.stringify(body), signal }),
  /** Viết bài theo dàn ý, mỗi mục xong gửi ngay — NDJSON */
  draft: (body: AiDraftRequest, onEvent: (event: AiDraftEvent) => void, signal?: AbortSignal) =>
    apiStreamNdjson<AiDraftEvent>('/ai-writer/news/draft/stream', onEvent, signal, body),
};
