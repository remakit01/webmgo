import type {
  AiKnowledgeInput,
  AiKnowledgeItem,
  AiKnowledgeListQuery,
  AiKnowledgeStats,
  AiKnowledgeSuggestion,
  AiReindexResult,
  AiRetrieveResult,
} from '@remak/shared/contracts/ai-knowledge';
import type { Paginated } from '@remak/shared/pagination';
import { apiFetch, ifMatch } from './api-client';

const query = (params: object) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '' && v !== null) q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : '';
};

// Kho "Kiến thức AI" (api/src/ai-knowledge)
export const aiKnowledgeApi = {
  list: (params: AiKnowledgeListQuery = {}) => apiFetch<Paginated<AiKnowledgeItem>>(`/ai-knowledge${query(params)}`),
  stats: () => apiFetch<AiKnowledgeStats>('/ai-knowledge/stats'),
  create: (body: AiKnowledgeInput) => apiFetch<AiKnowledgeItem>('/ai-knowledge', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: AiKnowledgeInput, version: string) =>
    apiFetch<AiKnowledgeItem>(`/ai-knowledge/${id}`, { method: 'PUT', body: JSON.stringify(body), headers: ifMatch(version) }),
  archive: (id: string, version: string) => apiFetch<AiKnowledgeItem>(`/ai-knowledge/${id}`, { method: 'DELETE', headers: ifMatch(version) }),
  /** Lưu kiến thức mới từ web đã duyệt (bỏ qua mẩu trùng) */
  acceptSuggestions: (items: AiKnowledgeSuggestion[]) =>
    apiFetch<{ created: AiKnowledgeItem[]; skipped: number }>('/ai-knowledge/accept-suggestions', { method: 'POST', body: JSON.stringify({ items }) }),
  /** Thử tra cứu: AI viết bài sẽ tìm thấy gì cho keyword này */
  search: (q: string) => apiFetch<AiRetrieveResult>(`/ai-knowledge/search${query({ q })}`),
  reindex: () => apiFetch<AiReindexResult>('/ai-knowledge/reindex', { method: 'POST' }),
};
