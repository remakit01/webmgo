'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Search, X } from 'lucide-react';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useToast } from '@/cms/components/ConfirmDialog';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import Skeleton from '@/cms/components/ui/Skeleton';
import { newsApi } from '@/cms/lib/news-api';
import type { NewsPostListItemCms } from '@/types/news';

/** Khối Tin tức trên trang chủ: 1 tin chính + 4 tin phụ */
const HOMEPAGE_SLOTS = 5;

export default function AdminHomepageNewsPage() {
  const showToast = useToast();
  const [saved, setSaved] = useState<NewsPostListItemCms[] | null>(null);
  const [featured, setFeatured] = useState<NewsPostListItemCms[]>([]);
  const [q, setQ] = useState('');
  const [candidates, setCandidates] = useState<NewsPostListItemCms[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    newsApi
      .list({ featured: true, pageSize: 50 })
      .then((r) => {
        setSaved(r.items);
        setFeatured(r.items);
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được bài nổi bật', 'error'));
  }, [showToast]);

  // Ứng viên: bài đã xuất bản bản tiếng Việt
  useEffect(() => {
    const t = setTimeout(() => {
      newsApi
        .list({ q: q.trim() || undefined, status: 'PUBLISHED', locale: 'vi', pageSize: 20 })
        .then((r) => setCandidates(r.items))
        .catch(() => setCandidates([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const dirty = JSON.stringify(featured.map((f) => f.id)) !== JSON.stringify((saved ?? []).map((f) => f.id));

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const move = (index: number, delta: number) =>
    setFeatured((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(Math.max(0, Math.min(next.length, index + delta)), 0, item);
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const r = await newsApi.setFeatured(featured.map((f) => f.id));
      setSaved(r.items);
      setFeatured(r.items);
      showToast('Đã cập nhật tin tức trang chủ', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const featuredIds = new Set(featured.map((f) => f.id));

  return (
    <AdminPage title="Tin Tức Trang Chủ" subtitle="Chọn và sắp xếp bài nổi bật hiển thị ở khối Tin tức (mục số 9) trên trang chủ">

      <AdminPageBody className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
        {/* DANH SÁCH NỔI BẬT THEO THỨ TỰ */}
        <section className="bg-white rounded-xl border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bài nổi bật ({featured.length})</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Vị trí 1 là tin chính (ảnh lớn), vị trí 2–{HOMEPAGE_SLOTS} là tin phụ. Bài sau vị trí {HOMEPAGE_SLOTS} chỉ hiện ở đầu trang Tin tức. Bài chưa có bản tiếng Anh sẽ không hiện ở trang /en.
              </p>
            </div>
            <a href="/#du-an-va-tin-tuc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800">
              Xem ngoài trang chủ <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>

          <ol className="divide-y divide-slate-100">
            {!saved &&
              Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="px-5 py-3"><Skeleton className="h-14 w-full rounded" /></li>
              ))}
            {saved && featured.length === 0 && (
              <li className="px-5 py-12 text-center text-xs text-slate-500">Chưa chọn bài nào — thêm từ danh sách bên phải.</li>
            )}
            {featured.map((item, i) => (
              <li key={item.id} className={`px-5 py-3 flex items-center gap-3 ${i >= HOMEPAGE_SLOTS ? 'opacity-60' : ''}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-remak-orange text-white' : i < HOMEPAGE_SLOTS ? 'bg-[#F4F9E8] text-[#4E7202]' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </span>
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO trong CMS
                  <img src={item.coverUrl} alt="" className={`${i === 0 ? 'w-28 h-16' : 'w-16 h-10'} rounded object-cover border border-slate-200 shrink-0`} />
                ) : (
                  <span className="w-16 h-10 rounded bg-slate-100 border border-dashed border-slate-300 shrink-0" />
                )}
                <span className="flex-1 min-w-0">
                  <Link href={`/admin/news/${item.id}`} className={`block font-semibold text-slate-900 hover:text-[#5F8A03] line-clamp-2 ${i === 0 ? 'text-sm' : 'text-xs'}`}>{item.title}</Link>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <StatusBadge prefix="VI" status={item.locales.vi?.status ?? null} />
                    <StatusBadge prefix="EN" status={item.locales.en?.status ?? null} />
                    {i === 0 && <span className="text-[10px] font-black uppercase text-remak-orange">Tin chính</span>}
                  </span>
                </span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <IconBtn label="Lên" onClick={() => move(i, -1)} disabled={i === 0} icon={ArrowUp} />
                  <IconBtn label="Xuống" onClick={() => move(i, 1)} disabled={i === featured.length - 1} icon={ArrowDown} />
                  <IconBtn label="Bỏ khỏi nổi bật" onClick={() => setFeatured((l) => l.filter((x) => x.id !== item.id))} icon={X} danger />
                </span>
              </li>
            ))}
          </ol>

          <div className="sticky bottom-4 m-4 bg-white/95 backdrop-blur p-3 rounded-xl border border-slate-300 shadow-lg flex items-center justify-end gap-2">
            <button type="button" disabled={!dirty || saving} onClick={() => saved && setFeatured(saved)} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
              Huỷ thay đổi
            </button>
            <button type="button" disabled={!dirty || saving} onClick={save} className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5">
              {saving && <Loader2 size={13} className="animate-spin" />} Lưu & cập nhật trang chủ
            </button>
          </div>
        </section>

        {/* CHỌN BÀI ĐỂ THÊM */}
        <aside className="bg-white rounded-xl border border-slate-300 shadow-2xs xl:sticky xl:top-20">
          <div className="px-4 py-3 border-b border-slate-200 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">Thêm bài đã xuất bản</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tiêu đề…" aria-label="Tìm bài để thêm" className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]" />
            </div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
            {!candidates && <li className="p-4"><Skeleton className="h-24 w-full rounded" /></li>}
            {candidates?.length === 0 && <li className="p-6 text-center text-xs text-slate-500">Không có bài phù hợp</li>}
            {candidates?.map((c) => (
              <li key={c.id} className="px-4 py-2.5 flex items-center gap-2">
                <span className="flex-1 min-w-0 text-xs font-semibold text-slate-800 line-clamp-2">{c.title}</span>
                <button
                  type="button"
                  disabled={featuredIds.has(c.id)}
                  onClick={() => setFeatured((l) => [...l, c])}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-[#F4F9E8] hover:text-[#4E7202] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Plus size={11} aria-hidden="true" /> {featuredIds.has(c.id) ? 'Đã chọn' : 'Thêm'}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </AdminPageBody>
    </AdminPage>
  );
}

function IconBtn({ label, onClick, icon: Icon, disabled, danger }: { label: string; onClick: () => void; icon: React.ComponentType<{ size?: number }>; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${danger ? 'hover:text-rose-600' : 'hover:text-[#5F8A03]'}`}
    >
      <Icon size={14} />
    </button>
  );
}
