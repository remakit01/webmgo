'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Archive, BrainCircuit, ExternalLink, Loader2, Pencil, Pin, Plus, RefreshCw, RotateCcw, Search } from 'lucide-react';
import {
  AI_KNOWLEDGE_KINDS,
  AI_KNOWLEDGE_KIND_LABEL,
  AI_KNOWLEDGE_LIMITS as L,
  AI_KNOWLEDGE_ORIGINS,
  AI_KNOWLEDGE_ORIGIN_LABEL,
  type AiKnowledgeItem,
  type AiKnowledgeKind,
  type AiRetrieveResult,
  type AiKnowledgeOrigin,
  type AiKnowledgeStats,
  type AiKnowledgeStatus,
} from '@remak/shared/contracts/ai-knowledge';
import type { Paginated } from '@remak/shared/pagination';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import Pagination from '@/cms/components/shared/Pagination';
import { inputClass } from '@/cms/components/shared/form-styles';
import Skeleton from '@/cms/components/ui/Skeleton';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { aiKnowledgeApi } from '@/cms/lib/ai-knowledge-api';
import { isConflict } from '@/cms/lib/api-client';

interface Form {
  id: string | null;
  version: string | null;
  status: AiKnowledgeStatus;
  kind: AiKnowledgeKind;
  title: string;
  content: string;
  tags: string;
  sourceUrl: string;
  sourceTitle: string;
  pinned: boolean;
}

const EMPTY: Form = { id: null, version: null, status: 'ACTIVE', kind: 'SPEC', title: '', content: '', tags: '', sourceUrl: '', sourceTitle: '', pinned: false };

const toForm = (k: AiKnowledgeItem): Form => ({
  id: k.id,
  version: k.version,
  status: k.status,
  kind: k.kind,
  title: k.title,
  content: k.content,
  tags: k.tags.join(', '),
  sourceUrl: k.sourceUrl ?? '',
  sourceTitle: k.sourceTitle ?? '',
  pinned: k.pinned,
});

const errorText = (err: unknown) =>
  isConflict(err) ? 'Mẩu kiến thức vừa được người khác sửa — đã tải lại bản mới nhất' : err instanceof Error ? err.message : 'Thao tác thất bại';

/** Ô lọc gọn (không giãn hết chiều ngang như inputClass) */
const filterClass = 'px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#5F8A03] cursor-pointer';

const ORIGIN_STYLE: Record<AiKnowledgeOrigin, string> = {
  SEED: 'bg-slate-100 text-slate-600',
  HUMAN: 'bg-sky-50 text-sky-700',
  AI_WEB: 'bg-violet-50 text-violet-700',
};

/** Trang quản lý kho "Kiến thức AI": AI viết bài tra cứu kho này (thông số sản phẩm, chứng nhận, quy trình...) */
export default function AiKnowledgeManager() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<Paginated<AiKnowledgeItem> | null>(null);
  const [stats, setStats] = useState<AiKnowledgeStats | null>(null);
  const [filters, setFilters] = useState<{ q: string; kind: '' | AiKnowledgeKind; status: AiKnowledgeStatus; origin: '' | AiKnowledgeOrigin; page: number }>({
    q: '',
    kind: '',
    status: 'ACTIVE',
    origin: '',
    page: 1,
  });
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => setIsAdmin(u?.role === 'ADMIN'))
      .catch(() => setIsAdmin(false));
  }, []);

  const reload = useCallback(async () => {
    try {
      const [list, s] = await Promise.all([
        aiKnowledgeApi.list({
          q: filters.q.trim() || undefined,
          kind: filters.kind || undefined,
          status: filters.status,
          origin: filters.origin || undefined,
          page: filters.page,
          pageSize: 30,
        }),
        aiKnowledgeApi.stats(),
      ]);
      setData(list);
      setStats(s);
    } catch (err) {
      showToast(errorText(err), 'error');
    }
  }, [filters, showToast]);

  useEffect(() => {
    const t = setTimeout(() => void reload(), 250);
    return () => clearTimeout(t);
  }, [reload]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.title.trim() || !form.content.trim()) return showToast('Nhập tiêu đề và nội dung', 'error');
    setSaving(true);
    const body = {
      kind: form.kind,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, L.tags),
      sourceUrl: form.sourceUrl.trim() || null,
      sourceTitle: form.sourceTitle.trim() || null,
      pinned: form.pinned,
      status: form.status,
    };
    try {
      if (form.id) await aiKnowledgeApi.update(form.id, body, form.version!);
      else await aiKnowledgeApi.create(body);
      setForm(null);
      showToast('Đã lưu — AI sẽ dùng kiến thức này từ lần viết tiếp theo', 'success');
    } catch (err) {
      showToast(errorText(err), 'error');
    } finally {
      setSaving(false);
      void reload();
    }
  };

  const archive = (k: AiKnowledgeItem) =>
    confirm({
      title: 'Lưu trữ mẩu kiến thức?',
      description: `AI sẽ không dùng “${k.title}” khi viết bài nữa. Có thể khôi phục trong mục "Đã lưu trữ".`,
      confirmText: 'Lưu trữ',
      variant: 'warning',
      onConfirm: async () => {
        await aiKnowledgeApi.archive(k.id, k.version);
        if (form?.id === k.id) setForm(null);
        await reload();
      },
      successMessage: 'Đã lưu trữ',
    });

  const restore = async (k: AiKnowledgeItem) => {
    try {
      await aiKnowledgeApi.update(k.id, { kind: k.kind, title: k.title, content: k.content, tags: k.tags, sourceUrl: k.sourceUrl, sourceTitle: k.sourceTitle, pinned: k.pinned, status: 'ACTIVE' }, k.version);
      showToast('Đã khôi phục', 'success');
    } catch (err) {
      showToast(errorText(err), 'error');
    } finally {
      void reload();
    }
  };

  const reindex = async () => {
    setReindexing(true);
    try {
      const r = await aiKnowledgeApi.reindex();
      showToast(
        r.failed
          ? `Lập chỉ mục được ${r.embedded} đoạn, còn ${r.failed} đoạn lỗi (hết quota?) — AI vẫn tìm theo từ khoá`
          : `Đã lập chỉ mục ${r.embedded} đoạn mới (${r.skipped} đoạn không đổi)`,
        r.failed ? 'warning' : 'success',
      );
    } catch (err) {
      showToast(errorText(err), 'error');
    } finally {
      setReindexing(false);
      void reload();
    }
  };

  const setFilter = (patch: Partial<typeof filters>) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  return (
    <AdminPage
        title="Kiến Thức AI"
        subtitle="Thông số sản phẩm, chứng nhận, quy trình… mà trợ lý AI tra cứu khi viết bài. Chỉ ghi điều đã kiểm chứng — AI coi đây là nguồn đúng nhất.">
      <AdminPageBody>
        {/* Thống kê + lập chỉ mục */}
        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs text-slate-700">
          <BrainCircuit size={16} className="text-[#5F8A03]" aria-hidden="true" />
          {stats ? (
            <span>
              <strong>{stats.active}</strong> mẩu đang dùng / {stats.total} · <strong>{stats.indexed}</strong> mẩu đã lập chỉ mục ngữ nghĩa
              <span className="text-slate-500"> ({stats.embeddingModel})</span>
            </span>
          ) : (
            <Skeleton className="h-4 w-64 rounded" />
          )}
          <span className="text-[11px] text-slate-500">Chưa lập chỉ mục vẫn được AI tìm theo từ khoá; hệ thống tự lập chỉ mục mỗi 10 phút.</span>
          {isAdmin && (
            <button
              type="button"
              onClick={reindex}
              disabled={reindexing}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              {reindexing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Lập chỉ mục lại
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] gap-6 items-start">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  value={filters.q}
                  onChange={(e) => setFilter({ q: e.target.value })}
                  placeholder="Tìm tiêu đề, nội dung…"
                  aria-label="Tìm kiến thức"
                  className="w-56 pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>
              <select value={filters.kind} onChange={(e) => setFilter({ kind: e.target.value as AiKnowledgeKind | '' })} aria-label="Lọc theo loại" className={filterClass}>
                <option value="">Mọi loại</option>
                {AI_KNOWLEDGE_KINDS.map((k) => (
                  <option key={k} value={k}>{AI_KNOWLEDGE_KIND_LABEL[k]}</option>
                ))}
              </select>
              <select value={filters.origin} onChange={(e) => setFilter({ origin: e.target.value as AiKnowledgeOrigin | '' })} aria-label="Lọc theo nguồn gốc" className={filterClass}>
                <option value="">Mọi nguồn</option>
                {AI_KNOWLEDGE_ORIGINS.map((o) => (
                  <option key={o} value={o}>{AI_KNOWLEDGE_ORIGIN_LABEL[o]}</option>
                ))}
              </select>
              <select value={filters.status} onChange={(e) => setFilter({ status: e.target.value as AiKnowledgeStatus })} aria-label="Lọc theo trạng thái" className={filterClass}>
                <option value="ACTIVE">Đang dùng</option>
                <option value="ARCHIVED">Đã lưu trữ</option>
              </select>
              <button
                type="button"
                onClick={() => setForm(EMPTY)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer"
              >
                <Plus size={13} aria-hidden="true" /> Thêm kiến thức
              </button>
            </div>

            <ul className="divide-y divide-slate-100">
              {!data && Array.from({ length: 6 }, (_, i) => <li key={i} className="px-4 py-3"><Skeleton className="h-10 w-full rounded" /></li>)}
              {data?.items.length === 0 && <li className="px-4 py-10 text-center text-xs text-slate-500">Không có mẩu kiến thức nào</li>}
              {data?.items.map((k) => (
                <li key={k.id} className={`px-4 py-3 flex items-start gap-3 text-xs ${form?.id === k.id ? 'bg-[#F4F9E8]/60' : ''}`}>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="flex items-center gap-1.5 flex-wrap">
                      {k.pinned && <Pin size={12} className="text-amber-600" aria-label="Luôn dùng" />}
                      <span className="font-semibold text-slate-900">{k.title}</span>
                    </p>
                    <p className="text-slate-600 line-clamp-2">{k.content}</p>
                    <p className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="rounded px-1.5 py-0.5 bg-[#F4F9E8] text-[#4E7202] font-semibold">{AI_KNOWLEDGE_KIND_LABEL[k.kind]}</span>
                      <span className={`rounded px-1.5 py-0.5 font-semibold ${ORIGIN_STYLE[k.origin]}`}>{AI_KNOWLEDGE_ORIGIN_LABEL[k.origin]}</span>
                      {k.status === 'ACTIVE' && (
                        <span className={k.indexed ? 'text-[#4E7202]' : 'text-slate-400'}>{k.indexed ? '● Đã lập chỉ mục' : '○ Chưa lập chỉ mục'}</span>
                      )}
                      {k.sourceUrl && (
                        <a href={k.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-sky-700 hover:underline">
                          <ExternalLink size={10} aria-hidden="true" /> {k.sourceTitle || 'Nguồn'}
                        </a>
                      )}
                    </p>
                  </div>
                  <button type="button" onClick={() => setForm(toForm(k))} aria-label="Sửa" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03] cursor-pointer">
                    <Pencil size={13} />
                  </button>
                  {k.status === 'ACTIVE' ? (
                    <button type="button" onClick={() => archive(k)} aria-label="Lưu trữ" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-rose-600 cursor-pointer">
                      <Archive size={13} />
                    </button>
                  ) : (
                    <button type="button" onClick={() => restore(k)} aria-label="Khôi phục" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03] cursor-pointer">
                      <RotateCcw size={13} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200">
                <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={(page) => setFilter({ page })} />
              </div>
            )}
          </div>

          {form ? (
            <form onSubmit={save} className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4 xl:sticky xl:top-20">
              <h2 className="text-sm font-bold text-slate-900">{form.id ? 'Sửa kiến thức' : 'Kiến thức mới'}</h2>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">Loại *</span>
                  <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as AiKnowledgeKind })} className={inputClass}>
                    {AI_KNOWLEDGE_KINDS.map((k) => (
                      <option key={k} value={k}>{AI_KNOWLEDGE_KIND_LABEL[k]}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" className="accent-[#5F8A03]" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                  Luôn dùng (ghim)
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Tiêu đề *</span>
                <input value={form.title} maxLength={L.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="vd: Tấm MGO FireOFF 12 mm — thông số" className={inputClass} />
              </label>
              <label className="block space-y-1">
                <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                  Nội dung *
                  <span className={`font-semibold tabular-nums ${form.content.length > L.content * 0.9 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {form.content.length}/{L.content}
                  </span>
                </span>
                <textarea
                  rows={12}
                  value={form.content}
                  maxLength={L.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={'Viết rõ ràng, mỗi dòng một ý, kèm số liệu chính xác.\nvd:\nĐộ dày: 12 mm\nGiới hạn chịu lửa: EI 120 (biên bản IBST số …)'}
                  className={`${inputClass} leading-relaxed font-mono text-[12px]`}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Tag</span>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Cách nhau bằng dấu phẩy, vd: ống gió, EI 60" className={inputClass} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">Link nguồn</span>
                  <input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://… hoặc /san-pham/…" className={inputClass} />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">Tên nguồn</span>
                  <input value={form.sourceTitle} maxLength={300} onChange={(e) => setForm({ ...form, sourceTitle: e.target.value })} placeholder="vd: Biên bản IBST 2024" className={inputClass} />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  Huỷ
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5">
                  {saving && <Loader2 size={13} className="animate-spin" />} Lưu kiến thức
                </button>
              </div>
            </form>
          ) : (
            <RetrieveTester />
          )}
        </div>
      </AdminPageBody>
    </AdminPage>
  );
}

/** Thử tra cứu: nhập keyword để xem AI viết bài sẽ lấy những kiến thức / bài cũ nào */
function RetrieveTester() {
  const showToast = useToast();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiRetrieveResult | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    try {
      setResult(await aiKnowledgeApi.search(q.trim()));
    } catch (err) {
      showToast(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-3 xl:sticky xl:top-20" aria-labelledby="kb-tester">
      <h2 id="kb-tester" className="text-sm font-bold text-slate-900">Thử tra cứu</h2>
      <p className="text-[11px] text-slate-500">Nhập keyword bài định viết để xem AI sẽ dùng kiến thức nào. Mẹo: mỗi mẩu một chủ đề hẹp để AI tìm đúng.</p>
      <form onSubmit={run} className="flex gap-2">
        <input value={q} maxLength={200} onChange={(e) => setQ(e.target.value)} placeholder="vd: tấm MGO bọc ống gió EI 60" aria-label="Keyword thử tra cứu" className={inputClass} />
        <button type="submit" disabled={busy || !q.trim()} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />} Tra cứu
        </button>
      </form>
      {result && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-600">
            Chế độ: <strong>{result.mode === 'hybrid' ? 'Ngữ nghĩa + từ khoá' : 'Từ khoá (chưa dùng được tìm ngữ nghĩa)'}</strong>
          </p>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800">Kiến thức ({result.facts.length})</h3>
            <ol className="space-y-1 list-decimal pl-5 text-xs text-slate-700">
              {result.facts.map((f) => (
                <li key={f.id}>
                  {f.pinned && <Pin size={11} className="inline text-amber-600 mr-1" aria-label="Luôn dùng" />}
                  {f.title} <span className="text-[10px] text-slate-400">· {AI_KNOWLEDGE_KIND_LABEL[f.kind]}</span>
                </li>
              ))}
            </ol>
          </div>
          {result.articles.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800">Bài đã đăng liên quan ({result.articles.length})</h3>
              <ul className="space-y-1 text-xs text-slate-700">
                {result.articles.map((a) => (
                  <li key={a.postId}>• {a.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
