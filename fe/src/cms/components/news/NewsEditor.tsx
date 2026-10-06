'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, ChevronDown, Copy, Loader2, RefreshCw, Save, Sparkles, Star, TriangleAlert } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { isTranslationStale } from '@remak/shared/translation';
import AdminHeader from '@/cms/components/AdminHeader';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import ImageUploadField from '@/cms/components/shared/ImageUploadField';
import SeoPanel from '@/cms/components/shared/SeoPanel';
import SlugField from '@/cms/components/shared/SlugField';
import { inputClass } from '@/cms/components/shared/form-styles';
import Skeleton from '@/cms/components/ui/Skeleton';
import { ApiError, isConflict } from '@/cms/lib/api-client';
import { describeAiError } from '@/cms/components/shared/ai-error';
import AiTranslateDialog, { type AiTranslateState } from '@/cms/components/shared/AiTranslateDialog';
import { newsApi, uploadContentImage } from '@/cms/lib/news-api';
import type { NewsAuthorCms, NewsCategoryCms, NewsPostCms, NewsTagCms, RichDoc } from '@/types/news';
import PublishPanel from './PublishPanel';
import TagPicker from './TagPicker';
import {
  EMPTY_META,
  EMPTY_TRANSLATION,
  LOCALE_LABEL,
  sameJson,
  toMetaDraft,
  toMetaInput,
  toTranslationDraft,
  toTranslationInput,
  validateTranslation,
  type MetaDraft,
  type TranslationDraft,
} from './news-form';

// Editor TipTap chỉ tải ở CMS, phía trình duyệt (không vào bundle site public)
const RichTextEditor = dynamic(() => import('@/cms/components/shared/rich-text/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-[480px] w-full rounded-xl" />,
});

const PANEL_ID = 'news-locale-panel';
const LOCALES: Locale[] = ['vi', 'en'];
type Drafts = Record<Locale, TranslationDraft>;
type Busy = 'load' | 'save' | 'publish' | 'ai' | null;

const draftsOf = (post: NewsPostCms | null): Drafts => ({
  vi: toTranslationDraft(post?.translations.vi),
  en: toTranslationDraft(post?.translations.en),
});

export default function NewsEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const showToast = useToast();

  const [post, setPost] = useState<NewsPostCms | null>(null);
  const [meta, setMeta] = useState<MetaDraft>(EMPTY_META);
  const [drafts, setDrafts] = useState<Drafts>({ vi: EMPTY_TRANSLATION, en: EMPTY_TRANSLATION });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Locale>('vi');
  const [busy, setBusy] = useState<Busy>(postId ? 'load' : null);
  const [banner, setBanner] = useState<{ message: string; conflict: boolean } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Locale, Record<string, string>>>>({});
  const [categories, setCategories] = useState<NewsCategoryCms[]>([]);
  const [authors, setAuthors] = useState<NewsAuthorCms[]>([]);
  const [tags, setTags] = useState<NewsTagCms[]>([]);
  const [aiResult, setAiResult] = useState<{ fallbackBlocks: number } | null>(null);
  const [aiState, setAiState] = useState<AiTranslateState | null>(null);
  const aiAbort = useRef<AbortController | null>(null);
  // Rời trang khi đang dịch -> ngắt kết nối để server dừng gọi Gemini
  useEffect(() => () => aiAbort.current?.abort(), []);

  const applyPost = useCallback((p: NewsPostCms) => {
    setPost(p);
    setMeta(toMetaDraft(p));
    setDrafts(draftsOf(p));
  }, []);

  useEffect(() => {
    Promise.all([newsApi.categories(), newsApi.authors(), newsApi.tags()])
      .then(([c, a, t]) => {
        setCategories(c);
        setAuthors(a);
        setTags(t);
        // Bài mới: chọn sẵn chuyên mục đầu tiên đang bật
        if (!postId) setMeta((m) => (m.categoryId ? m : { ...m, categoryId: c.find((x) => x.isActive)?.id ?? '' }));
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được chuyên mục / tác giả', 'error'));
  }, [postId, showToast]);

  useEffect(() => {
    if (!postId) return;
    newsApi
      .get(postId)
      .then(applyPost)
      .catch((err: unknown) => setBanner({ message: err instanceof Error ? err.message : 'Không tải được bài viết', conflict: false }))
      .finally(() => setBusy(null));
  }, [postId, applyPost]);

  // ── Trạng thái thay đổi ─────────────────────────────────────────────────
  const savedDrafts = useMemo(() => draftsOf(post), [post]);
  const savedMeta = useMemo(() => toMetaDraft(post), [post]);
  const dirtyLocales = LOCALES.filter((l) => !sameJson(drafts[l], savedDrafts[l]));
  const metaDirty = !sameJson(meta, savedMeta);
  const isDirty = metaDirty || coverFile !== null || dirtyLocales.length > 0;

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const draft = drafts[tab];
  const setDraft = useCallback(
    (patch: Partial<TranslationDraft>) => setDrafts((d) => ({ ...d, [tab]: { ...d[tab], ...patch } })),
    [tab],
  );
  const onContentChange = useCallback((content: RichDoc) => setDraft({ content }), [setDraft]);
  const checkSlug = useCallback(
    (slug: string) => newsApi.slugCheck(tab, slug, post?.id),
    [tab, post?.id],
  );

  const vi = post?.translations.vi;
  const en = post?.translations.en;
  const enStale = !!vi && !!en && isTranslationStale(vi.contentUpdatedAt, en.sourceUpdatedAt) && !drafts.en.sourceUpdatedAt;

  // ── Lưu ────────────────────────────────────────────────────────────────

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Lưu thất bại';
    setBanner({ message, conflict: isConflict(err) });
    showToast(message, 'error');
  };

  /** Kiểm tra trên máy trước khi gửi; trả false và nhảy tới tab có lỗi */
  const validate = (locales: Locale[], forPublish: Locale | null) => {
    const next: Partial<Record<Locale, Record<string, string>>> = {};
    for (const l of locales) {
      const e = validateTranslation(drafts[l], forPublish === l);
      if (Object.keys(e).length) next[l] = e;
    }
    setErrors(next);
    if (!meta.categoryId) {
      showToast('Hãy chọn chuyên mục', 'error');
      return false;
    }
    const first = locales.find((l) => next[l]);
    if (first) {
      setTab(first);
      showToast(`Bản ${LOCALE_LABEL[first]}: ${Object.values(next[first]!)[0]}`, 'error');
      return false;
    }
    return true;
  };

  /**
   * Lưu mọi phần đang thay đổi theo thứ tự: tạo bài / thông tin chung -> ảnh đại diện -> từng bản dịch.
   * Mỗi phần gửi kèm phiên bản riêng (If-Match); phần nào xong thì cập nhật ngay để bước sau lỗi không mất phần đã lưu.
   */
  const saveAll = async (): Promise<NewsPostCms | null> => {
    const locales = post ? dirtyLocales : (['vi', ...(sameJson(drafts.en, EMPTY_TRANSLATION) ? [] : ['en' as const])] as Locale[]);
    if (!validate(locales, null)) return null;
    setBanner(null);

    let current = post;
    try {
      if (!current) {
        const created = await newsApi.create({ ...toMetaInput(meta), categoryId: meta.categoryId, translation: toTranslationInput(drafts.vi, undefined) });
        current = created;
        setPost(created);
        setMeta(toMetaDraft(created));
        setDrafts((d) => ({ ...d, vi: toTranslationDraft(created.translations.vi) }));
      } else if (metaDirty) {
        current = await newsApi.updateMeta(current.id, toMetaInput(meta), current.version);
        setPost(current);
        setMeta(toMetaDraft(current));
      }
      if (coverFile) {
        current = await newsApi.uploadCover(current.id, coverFile, current.version);
        setPost(current);
        setCoverFile(null);
      }
      for (const l of locales) {
        if (l === 'vi' && !post) continue; // bản tiếng Việt đã gửi kèm lúc tạo bài
        const saved = await newsApi.saveTranslation(
          current.id,
          l,
          toTranslationInput(drafts[l], current.translations[l]?.slug),
          current.translations[l]?.version,
        );
        current = saved;
        setPost(saved);
        setDrafts((d) => ({ ...d, [l]: toTranslationDraft(saved.translations[l]) }));
      }
      if (!post) router.replace(`/admin/news/${current.id}`);
      return current;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const handleSave = async () => {
    setBusy('save');
    const saved = await saveAll();
    setBusy(null);
    if (saved) showToast('Đã lưu bài viết', 'success');
  };

  const handlePublish = async (publishedAt?: string) => {
    if (!validate([tab], tab)) return;
    if (!post?.cover && !coverFile) {
      setTab('vi');
      showToast('Cần ảnh đại diện trước khi xuất bản', 'error');
      return;
    }
    setBusy('publish');
    const saved = isDirty || !post ? await saveAll() : post;
    if (saved) {
      try {
        const published = await newsApi.publish(saved.id, tab, saved.translations[tab]!.version, publishedAt);
        setPost(published);
        setDrafts((d) => ({ ...d, [tab]: toTranslationDraft(published.translations[tab]) }));
        const status = published.translations[tab]?.status;
        showToast(status === 'SCHEDULED' ? 'Đã lên lịch đăng bài' : 'Đã xuất bản — trang web cập nhật trong giây lát', 'success');
      } catch (err) {
        handleError(err);
      }
    }
    setBusy(null);
  };

  const runStatusAction = (kind: 'unpublish' | 'archive') => {
    const t = post?.translations[tab];
    if (!post || !t) return;
    void confirm({
      title: kind === 'unpublish' ? `Gỡ bản ${LOCALE_LABEL[tab]} khỏi website?` : `Lưu trữ bản ${LOCALE_LABEL[tab]}?`,
      description:
        tab === 'vi'
          ? 'Bản tiếng Anh (nếu đang đăng) cũng bị gỡ theo. Nội dung vẫn được giữ để đăng lại sau.'
          : 'Nội dung vẫn được giữ để đăng lại sau.',
      confirmText: kind === 'unpublish' ? 'Gỡ bài' : 'Lưu trữ',
      variant: 'warning',
      onConfirm: async () => {
        const next = kind === 'unpublish' ? await newsApi.unpublish(post.id, tab, t.version) : await newsApi.archive(post.id, tab, t.version);
        setPost(next);
      },
      successMessage: kind === 'unpublish' ? 'Đã gỡ bài khỏi website' : 'Đã lưu trữ',
    });
  };

  /** Bản nháp tiếng Anh từ AI (dịch theo bản tiếng Việt ĐÃ LƯU) — điền vào form, chưa lưu gì */
  const runAiTranslate = async () => {
    if (!post || !vi) return;
    if (dirtyLocales.includes('vi')) {
      setTab('vi');
      showToast('Hãy lưu bản tiếng Việt trước — AI dịch theo bản tiếng Việt đã lưu', 'warning');
      return;
    }
    const hasEnContent = !sameJson(drafts.en, EMPTY_TRANSLATION);
    if (hasEnContent) {
      const ok = await confirm({
        title: 'Thay bản tiếng Anh bằng bản AI dịch?',
        description: 'Nội dung tiếng Anh đang có trên form sẽ được thay bằng bản dịch mới (chưa lưu cho tới khi bạn bấm Lưu). Đường dẫn tiếng Anh hiện tại được giữ nguyên.',
        confirmText: 'Dịch lại bằng AI',
        variant: 'warning',
      });
      if (!ok) return;
    }
    void startAiTranslate();
  };

  /** Chạy AI dịch kèm dialog tiến trình (prepare -> từng lô -> ghép bài); Huỷ = ngắt kết nối, server dừng lô kế tiếp */
  const startAiTranslate = async () => {
    if (!post) return;
    aiAbort.current?.abort();
    const abort = new AbortController();
    aiAbort.current = abort;
    setBusy('ai');
    setAiResult(null);
    const startedAt = Date.now();
    setAiState({ phase: 'connecting', startedAt });
    try {
      await newsApi.aiDraftStream(
        post.id,
        (event) => {
          if (event.type === 'prepare') {
            setAiState((s) => s && { ...s, phase: 'prepare', prepare: event, lastEventAt: Date.now() });
          } else if (event.type === 'progress') {
            setAiState((s) => s && { ...s, phase: 'translate', progress: event, lastEventAt: Date.now() });
          } else if (event.type === 'assemble') {
            setAiState((s) => s && { ...s, phase: 'assemble' });
          } else if (event.type === 'error') {
            setAiState((s) => s && { ...s, phase: 'error', finishedAt: Date.now(), error: describeAiError(event.status, event.message) });
          } else if (event.type === 'result') {
            const draftAi = event.draft;
            setDrafts((d) => ({
              ...d,
              en: {
                title: draftAi.title,
                slug: draftAi.slug,
                sapo: draftAi.sapo,
                content: draftAi.content,
                coverAlt: draftAi.coverAlt,
                coverCaption: draftAi.coverCaption ?? '',
                seoTitle: draftAi.seoTitle ?? '',
                seoDescription: draftAi.seoDescription ?? '',
                noindex: draftAi.noindex,
                sourceName: draftAi.sourceName ?? '',
                sourceUrl: draftAi.sourceUrl ?? '',
                origin: 'AI',
                sourceUpdatedAt: draftAi.sourceUpdatedAt,
              },
            }));
            setAiResult({ fallbackBlocks: draftAi.fallbackBlocks });
            setTab('en');
            setAiState((s) => s && { ...s, phase: 'done', finishedAt: Date.now(), fallbackBlocks: draftAi.fallbackBlocks });
          }
        },
        abort.signal,
      );
    } catch (err) {
      if (abort.signal.aborted) {
        setAiState(null);
        showToast('Đã huỷ dịch — bản tiếng Anh giữ nguyên như trước', 'info');
      } else {
        setAiState(
          (s) =>
            s && {
              ...s,
              phase: 'error',
              finishedAt: Date.now(),
              error: describeAiError(err instanceof ApiError ? err.status : 500, err instanceof Error ? err.message : ''),
            },
        );
      }
    } finally {
      if (aiAbort.current === abort) aiAbort.current = null;
      setBusy(null);
    }
  };

  /** Dịch tay: chép nguyên văn bản tiếng Việt sang form tiếng Anh để sửa dần */
  const copyViToEn = () => {
    if (!vi) return;
    setDrafts((d) => ({
      ...d,
      en: { ...toTranslationDraft(vi), slug: d.en.slug, origin: 'HUMAN', sourceUpdatedAt: vi.contentUpdatedAt },
    }));
    setAiState(null);
    setTab('en');
  };

  const reloadLatest = async () => {
    if (!post) return;
    try {
      applyPost(await newsApi.get(post.id));
      setCoverFile(null);
      setBanner(null);
      showToast('Đã tải bản mới nhất', 'success');
    } catch (err) {
      handleError(err);
    }
  };

  const discard = () => {
    setMeta(savedMeta);
    setDrafts(savedDrafts);
    setCoverFile(null);
    setErrors({});
    setBanner(null);
  };

  // ── Giao diện ──────────────────────────────────────────────────────────

  const title = postId ? (vi?.title ? `Sửa bài: ${vi.title}` : 'Sửa bài viết') : 'Viết bài mới';

  if (busy === 'load') {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <AdminHeader title="Đang tải bài viết…" />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-4">
            <Skeleton className="h-9 w-56 rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-[480px] w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const tabErrors = errors[tab] ?? {};
  const viLive = vi?.status === 'PUBLISHED' || vi?.status === 'SCHEDULED';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader title={title} subtitle="Soạn theo khối như báo điện tử: tiêu đề → sapo → nội dung (ảnh, bảng, video, hộp lưu ý, bài liên quan)" />

      <div className="p-4 sm:p-6 w-full space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/admin/news" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#5F8A03]">
            <ArrowLeft size={14} aria-hidden="true" /> Danh sách bài viết
          </Link>
          <LocaleTabs
            panelId={PANEL_ID}
            active={tab}
            onChange={setTab}
            tabs={[
              { locale: 'vi', label: 'Tiếng Việt', dirty: dirtyLocales.includes('vi') },
              { locale: 'en', label: en ? 'English' : 'English (chưa có)', dirty: dirtyLocales.includes('en') },
            ]}
          />
        </div>

        {banner && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">
              <strong className="font-bold">Không lưu được:</strong> {banner.message}
              {banner.conflict && (
                <span className="block mt-1 text-rose-600">Nội dung bạn đang sửa vẫn còn trên màn hình — hãy chép lại phần cần giữ trước khi tải bản mới.</span>
              )}
            </span>
            {banner.conflict && (
              <button type="button" onClick={reloadLatest} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-700 font-semibold hover:bg-rose-100 cursor-pointer">
                <RefreshCw size={13} aria-hidden="true" /> Tải bản mới nhất
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          {/* ── CỘT TRÁI: NỘI DUNG THEO NGÔN NGỮ ── */}
          <section role="tabpanel" id={PANEL_ID} aria-labelledby={`tab-${tab}`} lang={tab} className="space-y-4 min-w-0">
            {tab === 'en' && !vi && (
              <Notice tone="info">Hãy lưu bản tiếng Việt trước — bản tiếng Anh được dịch từ bản tiếng Việt.</Notice>
            )}
            {tab === 'en' && vi && !en && (
              <Notice tone="info">Bài chưa có bản tiếng Anh. Nhập bản dịch bên dưới; đường dẫn tiếng Anh sinh từ tiêu đề tiếng Anh (vd <code>/en/news/i-am-abc</code>).</Notice>
            )}
            {tab === 'en' && enStale && (
              <Notice tone="warning">
                Bản tiếng Việt đã sửa sau lần dịch gần nhất — hãy cập nhật bản tiếng Anh cho khớp.{' '}
                <button type="button" className="font-bold underline cursor-pointer" onClick={() => setDrafts((d) => ({ ...d, en: { ...d.en, sourceUpdatedAt: vi!.contentUpdatedAt } }))}>
                  Đánh dấu đã cập nhật
                </button>
              </Notice>
            )}
            {tab === 'en' && vi && (
              <div className="rounded-xl border border-[#7CB305]/40 bg-gradient-to-r from-[#F4F9E8] to-white px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#5F8A03]" aria-hidden="true" /> Dịch tự động bằng AI (Gemini)
                  </p>
                  <p className="mt-0.5">Dịch cả tiêu đề, sapo, nội dung, alt/chú thích ảnh và SEO; giữ nguyên ảnh, bảng, video, link. Chỉ điền vào form — bạn duyệt rồi mới lưu.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={copyViToEn} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
                    <Copy size={13} aria-hidden="true" /> Chép bản Việt để tự dịch
                  </button>
                  <button type="button" onClick={runAiTranslate} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50">
                    {busy === 'ai' ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} aria-hidden="true" />}
                    {busy === 'ai' ? 'Đang dịch… (bài dài có thể mất 1 phút)' : en ? 'Dịch lại bằng AI' : 'Dịch bằng AI'}
                  </button>
                </div>
              </div>
            )}
            {tab === 'en' && aiResult && drafts.en.origin === 'AI' && (
              <Notice tone="warning">
                <strong>Bản nháp do AI dịch — chưa lưu.</strong> Hãy đọc duyệt thuật ngữ, số liệu và tên tiêu chuẩn trước khi bấm Lưu nháp / Xuất bản.
                {aiResult.fallbackBlocks > 0 && ` Có ${aiResult.fallbackBlocks} đoạn AI làm mất định dạng (đậm/nghiêng/link) — kiểm tra lại các đoạn đó.`}
              </Notice>
            )}
            {tab === 'en' && vi && <ViReference vi={vi} />}

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4">
              <Field label="Tiêu đề *" error={tabErrors.title}>
                {(id) => (
                  <textarea
                    id={id}
                    rows={2}
                    value={draft.title}
                    maxLength={200}
                    onChange={(e) => setDraft({ title: e.target.value.replace(/\n/g, ' ') })}
                    placeholder={tab === 'vi' ? 'Tiêu đề bài viết (nên 60–100 ký tự)' : 'English title'}
                    aria-invalid={!!tabErrors.title}
                    className={`${inputClass} text-lg sm:text-xl font-bold leading-snug resize-none`}
                  />
                )}
              </Field>

              <SlugField
                key={`${tab}-${post?.translations[tab]?.slug ?? 'new'}`}
                value={draft.slug}
                onChange={(slug) => setDraft({ slug })}
                sourceText={draft.title}
                prefix={tab === 'vi' ? 'remak.vn/tin-tuc/' : 'remak.vn/en/news/'}
                autoFromSource={!post?.translations[tab]?.slug}
                published={!!post?.translations[tab]?.firstPublishedAt}
                checkAvailable={checkSlug}
              />

              <Field label="Sapo (đoạn mở đầu in đậm)" error={tabErrors.sapo} hint={`${draft.sapo.length}/600 · hiển thị ở danh sách tin và làm mô tả chia sẻ`}>
                {(id) => (
                  <textarea
                    id={id}
                    rows={3}
                    value={draft.sapo}
                    maxLength={600}
                    onChange={(e) => setDraft({ sapo: e.target.value })}
                    placeholder="Tóm tắt 1–3 câu nội dung chính của bài"
                    aria-invalid={!!tabErrors.sapo}
                    className={`${inputClass} font-semibold leading-relaxed`}
                  />
                )}
              </Field>
            </div>

            <div className="space-y-1.5">
              <RichTextEditor
                key={tab}
                value={draft.content}
                onChange={onContentChange}
                onUploadImage={async (file) => (await uploadContentImage(file)).url}
                currentPostId={post?.id}
                ariaLabel={`Nội dung bài viết (${LOCALE_LABEL[tab]})`}
              />
              {tabErrors.content && (
                <p role="alert" className="text-xs font-semibold text-rose-600">{tabErrors.content}</p>
              )}
            </div>
          </section>

          {/* ── CỘT PHẢI: XUẤT BẢN & THÔNG TIN BÀI ── */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <Panel title="Xuất bản">
              <PublishPanel
                key={`${tab}-${post?.translations[tab]?.version ?? 'none'}`}
                locale={tab}
                translation={post?.translations[tab]}
                blockedReason={tab === 'en' && !viLive ? 'Cần xuất bản bản tiếng Việt trước khi đăng bản tiếng Anh.' : null}
                busy={busy !== null}
                onPublish={handlePublish}
                onUnpublish={() => runStatusAction('unpublish')}
                onArchive={() => runStatusAction('archive')}
              />
            </Panel>

            <Panel title="Ảnh đại diện">
              <ImageUploadField
                label="Ảnh bìa bài viết"
                currentUrl={post?.cover?.url}
                file={coverFile}
                onPick={setCoverFile}
                onClear={() => setCoverFile(null)}
                uploading={busy === 'save' && coverFile !== null}
                hint="Mọi kích thước đều đăng được; nên dùng ảnh ngang ≥ 1200×630 để chia sẻ Facebook/Zalo đẹp."
              />
              <Field label={`Mô tả ảnh (alt, ${LOCALE_LABEL[tab]}) *`} error={tabErrors.coverAlt}>
                {(id) => (
                  <input id={id} value={draft.coverAlt} maxLength={300} onChange={(e) => setDraft({ coverAlt: e.target.value })} placeholder="Nội dung ảnh, vd: Thi công tấm MGO bọc ống gió" aria-invalid={!!tabErrors.coverAlt} className={inputClass} />
                )}
              </Field>
              <Field label={`Chú thích ảnh (${LOCALE_LABEL[tab]})`}>
                {(id) => <input id={id} value={draft.coverCaption} maxLength={500} onChange={(e) => setDraft({ coverCaption: e.target.value })} className={inputClass} />}
              </Field>
            </Panel>

            <Panel title="Phân loại">
              <Field label="Chuyên mục *">
                {(id) => (
                  <select id={id} value={meta.categoryId} onChange={(e) => setMeta((m) => ({ ...m, categoryId: e.target.value }))} className={inputClass}>
                    <option value="" disabled>Chọn chuyên mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.translations.vi?.name}
                        {c.isActive ? '' : ' (đang ẩn)'}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Tác giả">
                {(id) => (
                  <select id={id} value={meta.authorId} onChange={(e) => setMeta((m) => ({ ...m, authorId: e.target.value }))} className={inputClass}>
                    <option value="">Không ghi tác giả</option>
                    {authors.filter((a) => a.isActive || a.id === meta.authorId).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
              </Field>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Tag</span>
                <TagPicker
                  allTags={tags}
                  selected={meta.tagIds}
                  onChange={(tagIds) => setMeta((m) => ({ ...m, tagIds }))}
                  onCreate={async (name) => {
                    const created = await newsApi.createTag({ translations: { vi: { name } } });
                    setTags((t) => [created, ...t]);
                    return created;
                  }}
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" className="accent-[#5F8A03]" checked={meta.isFeatured} onChange={(e) => setMeta((m) => ({ ...m, isFeatured: e.target.checked }))} />
                <Star size={13} className="text-amber-500" aria-hidden="true" /> Bài nổi bật (trang chủ & đầu trang Tin tức)
              </label>
            </Panel>

            <Panel title={`SEO (${LOCALE_LABEL[tab]})`} collapsible>
              <SeoPanel
                url={`remak.vn${tab === 'vi' ? '/tin-tuc/' : '/en/news/'}${draft.slug || '...'}`}
                seoTitle={draft.seoTitle}
                seoDescription={draft.seoDescription}
                fallbackTitle={draft.title}
                fallbackDescription={draft.sapo}
                noindex={draft.noindex}
                onChange={(p) => setDraft(p)}
              />
            </Panel>

            <Panel title="Nguồn tin" collapsible>
              <Field label="Tên nguồn (hiển thị “Theo …”)">
                {(id) => <input id={id} value={draft.sourceName} maxLength={120} onChange={(e) => setDraft({ sourceName: e.target.value })} placeholder="vd: Báo Xây Dựng" className={inputClass} />}
              </Field>
              <Field label="Link bài gốc" error={tabErrors.sourceUrl}>
                {(id) => <input id={id} value={draft.sourceUrl} maxLength={500} onChange={(e) => setDraft({ sourceUrl: e.target.value })} placeholder="https://…" aria-invalid={!!tabErrors.sourceUrl} className={inputClass} />}
              </Field>
            </Panel>
          </aside>
        </div>

        <AiTranslateDialog
          open={aiState !== null}
          state={aiState}
          onCancel={() => aiAbort.current?.abort()}
          onClose={() => setAiState(null)}
          onRetry={() => void startAiTranslate()}
          onCopySource={copyViToEn}
        />

        {/* THANH LƯU CỐ ĐỊNH */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-slate-300 shadow-lg flex items-center justify-between gap-2.5 flex-wrap">
          <p className="text-[11px] text-slate-500">
            {isDirty ? (
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                <TriangleAlert size={12} aria-hidden="true" /> Có thay đổi chưa lưu
                {dirtyLocales.length > 0 && ` (${dirtyLocales.map((l) => l.toUpperCase()).join(', ')})`}
              </span>
            ) : post ? (
              'Đã lưu mọi thay đổi'
            ) : (
              'Bài mới — lưu nháp để bắt đầu'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={discard} disabled={!isDirty || busy !== null} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              Huỷ thay đổi
            </button>
            <button type="button" onClick={handleSave} disabled={(!isDirty && !!post) || busy !== null} className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5">
              {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Lưu nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Thành phần nhỏ ─────────────────────────────────────────────────────────

function Panel({ title, children, collapsible }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  if (collapsible) {
    return (
      <details className="group bg-white rounded-xl border border-slate-300 shadow-2xs">
        <summary className="flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-900 cursor-pointer list-none">
          {title}
          <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-4 pb-4 space-y-3">{children}</div>
      </details>
    );
  }
  return (
    <section className="bg-white rounded-xl border border-slate-300 shadow-2xs p-4 space-y-3">
      <h2 className="text-xs font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: (id: string) => React.ReactNode }) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-700">{label}</label>
      {children(id)}
      {error ? <p role="alert" className="text-[11px] font-semibold text-rose-600">{error}</p> : hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Notice({ tone, children }: { tone: 'info' | 'warning'; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-xs ${tone === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
      {children}
    </div>
  );
}

/** Bản tiếng Việt để đối chiếu khi dịch (thu gọn được) */
function ViReference({ vi }: { vi: NonNullable<NewsPostCms['translations']['vi']> }) {
  return (
    <details className="group rounded-xl border border-slate-300 bg-white">
      <summary className="flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 cursor-pointer list-none">
        Bản tiếng Việt để đối chiếu
        <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div lang="vi" className="px-4 pb-4 space-y-2 text-sm text-slate-700">
        <p className="text-base font-bold text-slate-900">{vi.title}</p>
        {vi.sapo && <p className="font-semibold">{vi.sapo}</p>}
        <p className="text-[11px] text-slate-500">{vi.readingMinutes} phút đọc · đường dẫn /tin-tuc/{vi.slug}</p>
      </div>
    </details>
  );
}
