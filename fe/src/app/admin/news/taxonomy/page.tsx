'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { NEWS_TAG_FILTERS, type NewsTagFilter } from '@remak/shared/contracts/news';
import { formatNumber } from '@remak/shared/date';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm } from '@/cms/components/ConfirmDialog';
import AuthorsPanel, { type AuthorsPanelHandle } from '@/cms/components/news/taxonomy/AuthorsPanel';
import TagsPanel, { type TagsPanelHandle, type TagsQueryState } from '@/cms/components/news/taxonomy/TagsPanel';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { newsApi } from '@/cms/lib/news-api';

type Tab = 'tags' | 'authors';
const TABS: { id: Tab; label: string; add: string }[] = [
  { id: 'tags', label: 'Tag bài viết', add: 'Thêm tag' },
  { id: 'authors', label: 'Tác giả', add: 'Thêm tác giả' },
];

// useSearchParams (tab, tìm / lọc, ?edit=) cần ranh giới Suspense (Next 16)
export default function AdminNewsTaxonomyPage() {
  return (
    <Suspense fallback={null}>
      <TaxonomyPage />
    </Suspense>
  );
}

function TaxonomyPage() {
  const confirm = useConfirm();
  const params = useSearchParams();
  const pathname = usePathname();
  // Đọc URL một lần lúc mở trang (sau đó trạng thái nằm ở state / panel)
  const [initial] = useState(() => ({
    tab: (params.get('tab') === 'authors' ? 'authors' : 'tags') as Tab,
    tags: {
      q: params.get('q') ?? '',
      filter: (NEWS_TAG_FILTERS as readonly string[]).includes(params.get('filter') ?? '') ? (params.get('filter') as NewsTagFilter) : undefined,
      sort: params.get('sort') === 'usage' ? 'usage' : undefined,
    } satisfies TagsQueryState,
    edit: params.get('edit'),
  }));
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState<Record<Tab, number | null>>({ tags: null, authors: null });
  const [dirty, setDirty] = useState(false);
  const tagsRef = useRef<TagsPanelHandle>(null);
  const authorsRef = useRef<AuthorsPanelHandle>(null);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ tags: null, authors: null });

  /** Ghi trạng thái lên URL (tải lại / gửi link giữ nguyên tab, bộ lọc, tác giả đang sửa) */
  const writeUrl = useCallback(
    (next: Record<string, string | undefined | null>) => {
      const p = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(next)) {
        if (v) p.set(k, v);
        else p.delete(k);
      }
      const qs = p.toString();
      window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname],
  );

  useEffect(() => {
    fetchCurrentUser().then((u) => setIsAdmin(u?.role === 'ADMIN')).catch(() => setIsAdmin(false));
    // Số trên cả 2 tab ngay từ đầu (panel đang mở sẽ cập nhật lại khi đổi dữ liệu)
    newsApi.tagStats().then((s) => setCounts((c) => ({ ...c, tags: s.total }))).catch(() => undefined);
    newsApi.authors().then((a) => setCounts((c) => ({ ...c, authors: a.length }))).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    const go = () => {
      setDirty(false);
      setTab(next);
      // Mỗi tab một bộ tham số riêng trên URL
      writeUrl({ tab: next === 'tags' ? null : next, q: null, filter: null, sort: null, edit: null });
    };
    if (!dirty) return go();
    confirm({ title: 'Bỏ thay đổi chưa lưu?', description: 'Những gì bạn vừa nhập ở tab này sẽ mất.', confirmText: 'Bỏ thay đổi', variant: 'warning', onConfirm: go });
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = TABS[(i + step + TABS.length) % TABS.length].id;
    switchTab(next);
    tabRefs.current[next]?.focus();
  };

  const onTagsQuery = useCallback((s: TagsQueryState) => writeUrl({ q: s.q, filter: s.filter, sort: s.sort }), [writeUrl]);
  const onEditChange = useCallback((edit: string | null) => writeUrl({ edit }), [writeUrl]);
  const onTagTotal = useCallback((n: number) => setCounts((c) => ({ ...c, tags: n })), []);
  const onAuthorTotal = useCallback((n: number) => setCounts((c) => ({ ...c, authors: n })), []);

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <AdminPage title="Tag & Tác Giả" subtitle="Tag gắn bài viết và hồ sơ tác giả (chức danh, tiểu sử) theo từng ngôn ngữ">
      <AdminPageBand
        label="Tag và tác giả"
        title={
          <div role="tablist" aria-label="Loại dữ liệu" className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-100 p-1">
            {TABS.map((t, i) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  id={`taxonomy-tab-${t.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="taxonomy-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => switchTab(t.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                    active ? 'bg-[#4E7202] text-white shadow-xs' : 'text-slate-700 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {t.label}
                  {counts[t.id] !== null && (
                    <span className={`rounded-full px-1.5 tabular-nums ${active ? 'bg-white/20' : 'bg-white text-slate-700'}`}>{formatNumber(counts[t.id]!)}</span>
                  )}
                </button>
              );
            })}
          </div>
        }
        actions={
          <button
            type="button"
            onClick={() => (tab === 'tags' ? tagsRef.current?.add() : authorsRef.current?.add())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <Plus size={14} aria-hidden="true" /> {current.add}
          </button>
        }
      />

      <AdminPageBody>
        <div id="taxonomy-panel" role="tabpanel" aria-labelledby={`taxonomy-tab-${tab}`}>
          {tab === 'tags' ? (
            <TagsPanel ref={tagsRef} initial={initial.tags} onQueryChange={onTagsQuery} onDirtyChange={setDirty} onTotal={onTagTotal} />
          ) : (
            <AuthorsPanel
              ref={authorsRef}
              isAdmin={isAdmin}
              initialEdit={initial.tab === 'authors' ? initial.edit : null}
              onEditChange={onEditChange}
              onDirtyChange={setDirty}
              onTotal={onAuthorTotal}
            />
          )}
        </div>
      </AdminPageBody>
    </AdminPage>
  );
}
