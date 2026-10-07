'use client';

import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { AlertTriangle, Hash, Loader2, Pencil, Search, SearchX, Tags, Trash2, X } from 'lucide-react';
import type { NewsTagFilter, NewsTagSort, NewsTagStats } from '@remak/shared/contracts/news';
import { formatNumber } from '@remak/shared/date';
import { normalizeSearchText } from '@remak/shared/text';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import IconAction from '@/cms/components/shared/IconAction';
import Skeleton from '@/cms/components/ui/Skeleton';
import { isConflict } from '@/cms/lib/api-client';
import { newsApi } from '@/cms/lib/news-api';
import type { NewsTagCms } from '@/types/news';

const LIMIT = 200; // API trả tối đa 200 tag / lần
const NAME_MAX = 100;

export interface TagsPanelHandle {
  add: () => void;
}
export interface TagsQueryState {
  q: string;
  filter?: NewsTagFilter;
  sort?: NewsTagSort;
}

interface Editing {
  id: string | null;
  version: string | null;
  vi: string;
  en: string;
  /** Giá trị lúc mở — để biết có thay đổi chưa lưu */
  start: { vi: string; en: string };
}

const FILTERS: { value: NewsTagFilter | undefined; label: string; count: (s: NewsTagStats) => number }[] = [
  { value: undefined, label: 'Tất cả', count: (s) => s.total },
  { value: 'missing_en', label: 'Chưa dịch tiếng Anh', count: (s) => s.missingEn },
  { value: 'unused', label: 'Chưa dùng', count: (s) => s.unused },
];

const editId = (id: string) => `tag-edit-${id}`;
const nameOf = (t: NewsTagCms) => t.translations.vi?.name ?? '(chưa đặt tên)';

/**
 * Tab Tag: tìm (không phân biệt dấu), lọc nhanh có số đếm, sắp xếp, sửa ngay trên dòng (Enter lưu / Esc huỷ),
 * cảnh báo tag trùng tên, chọn nhiều để xoá. Trạng thái tìm / lọc / sắp nằm trên URL (trang cha ghi).
 */
const TagsPanel = forwardRef<
  TagsPanelHandle,
  {
    initial: TagsQueryState;
    onQueryChange: (q: TagsQueryState) => void;
    onDirtyChange: (dirty: boolean) => void;
    onTotal: (n: number) => void;
  }
>(function TagsPanel({ initial, onQueryChange, onDirtyChange, onTotal }, ref) {
  const confirm = useConfirm();
  const showToast = useToast();
  const ids = useId();
  const [q, setQ] = useState(initial.q);
  const [query, setQuery] = useState<TagsQueryState>(initial);
  const [tags, setTags] = useState<NewsTagCms[] | null>(null);
  const [stats, setStats] = useState<NewsTagStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Editing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [duplicate, setDuplicate] = useState<NewsTagCms | null>(null);
  const viRef = useRef<HTMLInputElement>(null);

  const dirty = !!editing && (editing.vi !== editing.start.vi || editing.en !== editing.start.en);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([newsApi.tags(query.q || undefined, { filter: query.filter, sort: query.sort }), newsApi.tagStats()]);
      setTags(list);
      setStats(s);
      onTotal(s.total);
      setSelected((cur) => new Set([...cur].filter((id) => list.some((t) => t.id === id))));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không tải được tag', 'error');
    } finally {
      setLoading(false);
    }
  }, [query, showToast, onTotal]);

  useEffect(() => {
    void load();
  }, [load]);

  // Gõ tìm: 300ms mới tải lại + ghi URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim() === query.q) return;
      const next = { ...query, q: q.trim() };
      setQuery(next);
      onQueryChange(next);
    }, 300);
    return () => clearTimeout(t);
  }, [q, query, onQueryChange]);

  const patchQuery = (p: Partial<TagsQueryState>) => {
    const next = { ...query, ...p };
    setQuery(next);
    onQueryChange(next);
  };

  // Cảnh báo trùng tên: hỏi API (tìm không phân biệt dấu) rồi so khớp tên đã chuẩn hoá
  useEffect(() => {
    const name = editing?.vi.trim() ?? '';
    if (!name) return;
    const currentId = editing?.id ?? null;
    const t = setTimeout(async () => {
      const found = await newsApi.tags(name).catch(() => []);
      const key = normalizeSearchText(name);
      setDuplicate(
        found.find((x) => x.id !== currentId && Object.values(x.translations).some((tr) => tr && normalizeSearchText(tr.name) === key)) ?? null,
      );
    }, 300);
    return () => clearTimeout(t);
  }, [editing?.vi, editing?.id]);

  /** Có thay đổi chưa lưu ở dòng đang sửa -> hỏi trước khi bỏ */
  const guard = (action: () => void) => {
    if (!dirty) return action();
    confirm({ title: 'Bỏ thay đổi chưa lưu?', description: 'Tên tag bạn vừa nhập sẽ mất.', confirmText: 'Bỏ thay đổi', variant: 'warning', onConfirm: action });
  };

  const startEdit = (t: NewsTagCms | null) => {
    const vi = t?.translations.vi?.name ?? '';
    const en = t?.translations.en?.name ?? '';
    setEditing({ id: t?.id ?? null, version: t?.version ?? null, vi, en, start: { vi, en } });
    setError(null);
    setDuplicate(null);
    requestAnimationFrame(() => viRef.current?.focus());
  };

  const cancel = () => {
    const id = editing?.id;
    setEditing(null);
    setError(null);
    setDuplicate(null);
    if (id) requestAnimationFrame(() => document.getElementById(editId(id))?.focus());
  };

  useImperativeHandle(ref, () => ({ add: () => guard(() => startEdit(null)) }));

  const save = async () => {
    if (!editing) return;
    if (!editing.vi.trim()) {
      setError('Nhập tên tag tiếng Việt');
      return viRef.current?.focus();
    }
    setSaving(true);
    setError(null);
    const body = { translations: { vi: { name: editing.vi.trim() }, en: editing.en.trim() ? { name: editing.en.trim() } : null } };
    try {
      if (editing.id) await newsApi.updateTag(editing.id, body, editing.version!);
      else await newsApi.createTag(body);
      showToast(editing.id ? 'Đã lưu tag' : 'Đã tạo tag', 'success');
      const id = editing.id;
      setEditing(null);
      setDuplicate(null);
      await load();
      if (id) requestAnimationFrame(() => document.getElementById(editId(id))?.focus());
    } catch (err) {
      setError(isConflict(err) ? 'Tag vừa được người khác sửa — bấm Huỷ rồi sửa lại trên bản mới nhất.' : err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const remove = (t: NewsTagCms) =>
    confirm({
      title: 'Xoá tag?',
      description: t.postCount ? `Tag “${nameOf(t)}” sẽ bị gỡ khỏi ${t.postCount} bài viết.` : `Tag “${nameOf(t)}” chưa gắn bài nào.`,
      confirmText: 'Xoá tag',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.removeTag(t.id);
        if (editing?.id === t.id) setEditing(null);
        await load();
      },
      successMessage: 'Đã xoá tag',
    });

  const removeSelected = () => {
    const chosen = (tags ?? []).filter((t) => selected.has(t.id));
    const posts = chosen.reduce((n, t) => n + t.postCount, 0);
    confirm({
      title: `Xoá ${chosen.length} tag?`,
      description: posts ? `Các tag sẽ bị gỡ khỏi tổng cộng ${posts} lượt gắn trên bài viết.` : 'Các tag này chưa gắn bài nào.',
      confirmText: `Xoá ${chosen.length} tag`,
      variant: 'danger',
      onConfirm: async () => {
        const { deleted } = await newsApi.bulkDeleteTags(chosen.map((t) => t.id));
        setSelected(new Set());
        if (editing?.id && chosen.some((t) => t.id === editing.id)) setEditing(null);
        await load();
        showToast(`Đã xoá ${deleted} tag`, 'success');
      },
    });
  };

  const visible = tags ?? [];
  const allChecked = visible.length > 0 && visible.every((t) => selected.has(t.id));
  const someChecked = visible.some((t) => selected.has(t.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(visible.map((t) => t.id)));
  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const editRow = editing && (
    <tr>
      <td colSpan={4} className="bg-[#F4F9E8] px-4 py-3 shadow-[inset_3px_0_0_#4E7202]">
        <div
          className="space-y-2"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              guard(cancel);
            } else if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault();
              void save();
            }
          }}
        >
          <p className="text-xs font-bold text-slate-800">{editing.id ? 'Sửa tag' : 'Tag mới'} <span className="font-normal text-slate-600">— Enter để lưu, Esc để huỷ</span></p>
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-56 flex-1 space-y-1">
              <label htmlFor={`${ids}-vi`} className="text-xs font-bold text-slate-700">
                Tên tiếng Việt <span className="text-rose-700">*</span>
              </label>
              <input
                ref={viRef}
                id={`${ids}-vi`}
                value={editing.vi}
                maxLength={NAME_MAX}
                aria-invalid={!!error && !editing.vi.trim()}
                aria-describedby={error ? `${ids}-err` : duplicate ? `${ids}-dup` : undefined}
                onChange={(e) => {
                  const vi = e.target.value;
                  setEditing((s) => s && { ...s, vi });
                  if (!vi.trim()) setDuplicate(null);
                  if (error) setError(null);
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40 aria-[invalid=true]:border-rose-400"
              />
            </div>
            <div className="min-w-56 flex-1 space-y-1">
              <label htmlFor={`${ids}-en`} className="text-xs font-bold text-slate-700">
                Tên tiếng Anh <span className="font-normal text-slate-600">(bỏ trống = dùng tên tiếng Việt)</span>
              </label>
              <input
                id={`${ids}-en`}
                lang="en"
                value={editing.en}
                maxLength={NAME_MAX}
                onChange={(e) => setEditing((s) => s && { ...s, en: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40"
              />
            </div>
            <div className="flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || (!!editing.id && !dirty)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
              >
                {saving && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                {editing.id ? 'Lưu' : 'Tạo tag'}
              </button>
              <button
                type="button"
                onClick={() => guard(cancel)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
              >
                Huỷ
              </button>
            </div>
          </div>
          {error && (
            <p id={`${ids}-err`} role="alert" className="text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
          {duplicate && !error && (
            <p id={`${ids}-dup`} className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
              Đã có tag “{nameOf(duplicate)}” ({duplicate.postCount} bài) — nên dùng tag đó thay vì tạo thêm.
              <button
                type="button"
                onClick={() => {
                  const d = duplicate;
                  guard(() => startEdit(d));
                }}
                className="rounded-md border border-amber-400 bg-white px-2 py-1 font-semibold hover:bg-amber-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
              >
                Sửa tag đó
              </button>
            </p>
          )}
        </div>
      </td>
    </tr>
  );

  const filtered = !!(query.q || query.filter);

  return (
    <div className="space-y-4">
      {/* Thanh công cụ */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-300 bg-white p-4 shadow-2xs">
        <div className="w-72 space-y-1">
          <label htmlFor={`${ids}-q`} className="text-xs font-bold text-slate-700">
            Tìm tag
          </label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id={`${ids}-q`}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Gõ có dấu hoặc không dấu…"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Xoá từ khoá"
                className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <span id={`${ids}-filter`} className="block text-xs font-bold text-slate-700">
            Lọc
          </span>
          <div role="group" aria-labelledby={`${ids}-filter`} className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const active = query.filter === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patchQuery({ filter: f.value })}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5F8A03] ${
                    active ? 'border-[#4E7202] bg-[#4E7202] text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                  {stats && (
                    <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>{formatNumber(f.count(stats))}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="w-48 space-y-1">
          <label htmlFor={`${ids}-sort`} className="text-xs font-bold text-slate-700">
            Sắp xếp
          </label>
          <select
            id={`${ids}-sort`}
            value={query.sort ?? 'recent'}
            onChange={(e) => patchQuery({ sort: e.target.value === 'usage' ? 'usage' : undefined })}
            className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40"
          >
            <option value="recent">Mới tạo</option>
            <option value="usage">Dùng nhiều nhất</option>
          </select>
        </div>
      </div>

      {/* Thanh hành động khi chọn nhiều */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#4E7202]/40 bg-[#F4F9E8] px-4 py-2.5" role="region" aria-label="Thao tác với tag đã chọn">
          <p className="text-sm font-semibold text-[#3F5E02]" aria-live="polite">
            Đã chọn {selected.size} tag
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelected(new Set())} className="h-9 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-white cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]">
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={removeSelected}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-700 px-3.5 text-sm font-semibold text-white hover:bg-rose-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
            >
              <Trash2 size={15} aria-hidden="true" /> Xoá {selected.size} tag
            </button>
          </div>
        </div>
      )}

      {/* Bảng */}
      <div className="overflow-clip rounded-xl border border-slate-300 bg-white shadow-2xs">
        <table className="w-full border-collapse text-left text-sm" aria-busy={loading}>
          <caption className="sr-only">Tag bài viết</caption>
          <thead className="bg-slate-100 text-xs font-semibold text-slate-700 shadow-[inset_0_-1px_0_var(--color-slate-300)]">
            <tr>
              <th scope="col" className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả tag đang hiện"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allChecked;
                  }}
                  onChange={toggleAll}
                  disabled={!visible.length}
                  className="h-4 w-4 cursor-pointer accent-[#4E7202]"
                />
              </th>
              <th scope="col" className="px-4 py-3">Tag</th>
              <th scope="col" className="w-32 px-4 py-3 text-right">Số bài</th>
              <th scope="col" className="w-28 px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-200 ${loading && tags ? 'opacity-60' : ''}`}>
            {editing && !editing.id && editRow}
            {tags === null &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-4 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-48 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="ml-auto h-5 w-8 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="ml-auto h-8 w-20 rounded" /></td>
                </tr>
              ))}
            {tags?.length === 0 && !(editing && !editing.id) && (
              <tr>
                <td colSpan={4} className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
                    {filtered ? <SearchX size={22} aria-hidden="true" /> : <Tags size={22} aria-hidden="true" />}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{filtered ? 'Không có tag nào khớp' : 'Chưa có tag nào'}</p>
                  <p className="mt-1 text-sm text-slate-600">{filtered ? 'Thử từ khoá khác hoặc bỏ bộ lọc.' : 'Tag giúp gom các bài cùng chủ đề.'}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (filtered) {
                        setQ('');
                        patchQuery({ q: '', filter: undefined });
                      } else startEdit(null);
                    }}
                    className="mt-4 h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
                  >
                    {filtered ? 'Xoá tìm kiếm & bộ lọc' : 'Thêm tag đầu tiên'}
                  </button>
                </td>
              </tr>
            )}
            {tags?.map((t) =>
              editing?.id === t.id ? (
                <React.Fragment key={t.id}>{editRow}</React.Fragment>
              ) : (
                <tr key={t.id} className={selected.has(t.id) ? 'bg-[#F4F9E8]/60' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Chọn tag ${nameOf(t)}`}
                      checked={selected.has(t.id)}
                      onChange={() => toggle(t.id)}
                      className="h-4 w-4 cursor-pointer accent-[#4E7202]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center font-semibold text-slate-900">
                      <Hash size={14} className="text-slate-500" aria-hidden="true" />
                      {nameOf(t)}
                    </span>
                    <span className="ml-3 text-xs text-slate-700" lang="en">
                      {t.translations.en ? (
                        <>
                          <span className="font-semibold text-slate-600">EN:</span> #{t.translations.en.name}
                        </>
                      ) : (
                        <span className="inline-flex rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">Chưa dịch tiếng Anh</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {t.postCount ? (
                      <span className="font-bold text-slate-900">{formatNumber(t.postCount)}</span>
                    ) : (
                      <span className="inline-flex rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">Chưa dùng</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-1">
                      <IconAction id={editId(t.id)} label={`Sửa “${nameOf(t)}”`} icon={Pencil} onClick={() => guard(() => startEdit(t))} />
                      <IconAction label={`Xoá “${nameOf(t)}”`} icon={Trash2} danger onClick={() => remove(t)} tipAlign="end" />
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {tags && tags.length > 0 && (
          <p className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700" aria-live="polite">
            {tags.length >= LIMIT
              ? `Đang hiện ${LIMIT} tag đầu — tìm hoặc lọc để thấy tag khác.`
              : `Hiện ${formatNumber(tags.length)} tag${filtered && stats ? ` / ${formatNumber(stats.total)}` : ''}.`}
          </p>
        )}
      </div>
    </div>
  );
});

export default TagsPanel;
