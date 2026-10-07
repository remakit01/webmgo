'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Copy,
  Eye,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Info,
  Loader2,
  PenLine,
  RefreshCw,
  Save,
  Send,
  SlidersHorizontal,
  Sparkles,
  Star,
  TriangleAlert,
} from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { isTranslationStale } from '@remak/shared/translation';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import ImageUploadField from '@/cms/components/shared/ImageUploadField';
import SeoPanel from '@/cms/components/shared/SeoPanel';
import SlugField from '@/cms/components/shared/SlugField';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import { AdminPageBody } from '@/cms/components/layout/AdminPage';
import { inputClass } from '@/cms/components/shared/form-styles';
import Skeleton from '@/cms/components/ui/Skeleton';
import { ApiError, isConflict } from '@/cms/lib/api-client';
import { describeAiError } from '@/cms/components/shared/ai-error';
import AiTranslateDialog, { type AiTranslateState } from '@/cms/components/shared/AiTranslateDialog';
import { newsApi, uploadContentImage } from '@/cms/lib/news-api';
import type { NewsAuthorCms, NewsCategoryCms, NewsPostCms, NewsTagCms, RichDoc } from '@/types/news';
import AiBadge from '@/cms/components/shared/AiBadge';
import ContentScorePanel from './ContentScorePanel';
import NewsStatsPanel from './NewsStatsPanel';
import AiWriterPanel from './ai-writer/AiWriterPanel';
import { docHasText } from './ai-writer/ai-doc';
import { AI_FILL_FIELDS, type AiFillField, type AiWriterHost } from './ai-writer/types';
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

function countDocWords(title: string, sapo: string, doc: RichDoc): { words: number; minutes: number } {
  let text = `${title} ${sapo} `;
  function walk(node: unknown) {
    if (node && typeof node === 'object') {
      const n = node as { text?: unknown; content?: unknown };
      if (typeof n.text === 'string') text += n.text + ' ';
      if (Array.isArray(n.content)) n.content.forEach(walk);
    }
  }
  walk(doc);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, minutes };
}

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
  // ── Viết cùng AI ──
  const [writerOpen, setWriterOpen] = useState(false);
  const [aiWriting, setAiWriting] = useState(false);
  /** Giá trị AI đã điền từng ô (bản tiếng Việt) — ô còn đúng giá trị này = chưa bị người dùng sửa -> hiện nhãn "AI" */
  const [aiFilled, setAiFilled] = useState<Partial<Record<AiFillField | 'categoryId', string>>>({});
  const [fanOut, setFanOut] = useState<string[]>([]);
  // Bản mới nhất của state cho các hàm async của panel (tránh closure cũ)
  const latest = useRef({ drafts, meta, tags, aiFilled });
  useEffect(() => {
    latest.current = { drafts, meta, tags, aiFilled };
  }, [drafts, meta, tags, aiFilled]);
  const categoryTouched = useRef(false);
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

  // Tác giả đang chọn (chức danh theo ngôn ngữ đang soạn) — một tiêu chí GEO / E-E-A-T
  const scoreAuthor = useMemo(() => {
    const a = authors.find((x) => x.id === meta.authorId);
    return a ? { name: a.name, jobTitle: a.translations[tab]?.jobTitle ?? null } : null;
  }, [authors, meta.authorId, tab]);
  const categoryOptions = useMemo(
    () => categories.filter((c) => c.isActive).map((c) => ({ id: c.id, name: c.translations.vi?.name ?? c.id })),
    [categories],
  );

  const writerHost = useMemo<AiWriterHost>(
    () => ({
      initialKeyword: drafts.vi.focusKeyword,
      categories: categoryOptions,
      fill: (patch, options) => {
        const { drafts: d, aiFilled: filled } = latest.current;
        const apply: Partial<Record<AiFillField, string>> = {};
        const skipped: AiFillField[] = [];
        for (const field of AI_FILL_FIELDS) {
          const value = patch[field];
          if (value === undefined) continue;
          const current = d.vi[field];
          // Chỉ điền ô trống hoặc ô AI điền trước đó mà người dùng chưa sửa
          if (options?.force || !current.trim() || current === filled[field]) apply[field] = value;
          else skipped.push(field);
        }
        if (Object.keys(apply).length) {
          setDrafts((x) => ({ ...x, vi: { ...x.vi, ...apply } }));
          setAiFilled((f) => ({ ...f, ...apply }));
        }
        return skipped;
      },
      setCategory: (id, options) => {
        if (categoryTouched.current && !options?.force) return false;
        setMeta((m) => ({ ...m, categoryId: id }));
        setAiFilled((f) => ({ ...f, categoryId: id }));
        return true;
      },
      addTags: async (names) => {
        const { meta: m, tags: all } = latest.current;
        const norm = (x: string) => x.trim().toLowerCase();
        const ids: string[] = [];
        const created: NewsTagCms[] = [];
        for (const name of names) {
          const found = [...all, ...created].find((t) => norm(t.translations.vi?.name ?? '') === norm(name));
          if (found) {
            ids.push(found.id);
          } else {
            const tag = await newsApi.createTag({ translations: { vi: { name: name.trim() } } });
            created.push(tag);
            ids.push(tag.id);
          }
        }
        if (created.length) setTags((t) => [...created, ...t]);
        const added = ids.filter((id) => !m.tagIds.includes(id));
        if (added.length) setMeta((x) => ({ ...x, tagIds: [...x.tagIds, ...added.filter((id) => !x.tagIds.includes(id))] }));
        return added.length;
      },
      confirmReplaceContent: async () =>
        !docHasText(latest.current.drafts.vi.content) ||
        confirm({
          title: 'Thay nội dung bài bằng bài AI viết?',
          description:
            'Nội dung tiếng Việt đang có trong editor sẽ được thay bằng bài AI viết (chưa lưu cho tới khi bạn bấm Lưu nháp). Bấm Huỷ để giữ nguyên.',
          confirmText: 'Thay bằng bài AI',
          variant: 'warning',
        }),
      setContent: (doc) => setDrafts((x) => ({ ...x, vi: { ...x.vi, content: doc, origin: 'AI' } })),
      getContent: () => latest.current.drafts.vi.content,
      setWriting: setAiWriting,
      setFanOut,
    }),
    [categoryOptions, confirm, drafts.vi.focusKeyword],
  );

  const openWriter = () => {
    setTab('vi');
    setWriterOpen(true);
  };
  /** Ô bản tiếng Việt vẫn đang giữ đúng giá trị AI điền */
  const isAi = (field: AiFillField) => tab === 'vi' && !!aiFilled[field] && drafts.vi[field] === aiFilled[field];

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

  /** Bản nháp tiếng Anh từ AI (dịch theo bản tiếng Việt) — điền vào form, chưa lưu gì */
  const runAiTranslate = async () => {
    if (!drafts.vi.title.trim()) {
      setTab('vi');
      showToast('Vui lòng nhập tiêu đề bài viết tiếng Việt trước khi dịch', 'warning');
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

    let targetPostId = post?.id;
    // Nếu bài viết mới chưa lưu hoặc bản tiếng Việt có thay đổi chưa lưu -> tự động lưu trước để server có dữ liệu dịch
    if (!post || dirtyLocales.includes('vi') || isDirty) {
      setBusy('save');
      showToast('Đang lưu bản tiếng Việt trước khi gọi AI dịch…', 'info');
      const saved = await saveAll();
      setBusy(null);
      if (!saved) {
        showToast('Không thể lưu bài viết để chuẩn bị dịch AI', 'error');
        return;
      }
      targetPostId = saved.id;
    }

    if (!targetPostId) return;
    void startAiTranslate(targetPostId);
  };

  /** Chạy AI dịch kèm dialog tiến trình (prepare -> từng lô -> ghép bài); Huỷ = ngắt kết nối, server dừng lô kế tiếp */
  const startAiTranslate = async (postIdToUse?: string) => {
    const currentPostId = postIdToUse || post?.id;
    if (!currentPostId) return;
    aiAbort.current?.abort();
    const abort = new AbortController();
    aiAbort.current = abort;
    setBusy('ai');
    setAiResult(null);
    const startedAt = Date.now();
    setAiState({ phase: 'connecting', startedAt });
    try {
      await newsApi.aiDraftStream(
        currentPostId,
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
                focusKeyword: draftAi.focusKeyword ?? '',
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
    const sourceVi = drafts.vi;
    if (!sourceVi.title && !sourceVi.content) {
      showToast('Chưa có nội dung tiếng Việt để sao chép', 'warning');
      return;
    }
    setDrafts((d) => ({
      ...d,
      en: {
        ...d.en,
        title: sourceVi.title,
        sapo: sourceVi.sapo,
        content: sourceVi.content,
        coverAlt: sourceVi.coverAlt,
        coverCaption: sourceVi.coverCaption,
        focusKeyword: sourceVi.focusKeyword,
        seoTitle: sourceVi.seoTitle,
        seoDescription: sourceVi.seoDescription,
        noindex: sourceVi.noindex,
        sourceName: sourceVi.sourceName,
        sourceUrl: sourceVi.sourceUrl,
        slug: d.en.slug || '',
        origin: 'HUMAN',
        sourceUpdatedAt: vi?.contentUpdatedAt,
      },
    }));
    setAiState(null);
    setTab('en');
    showToast('Đã chép nội dung bản tiếng Việt sang tiếng Anh', 'success');
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

  const { words, minutes } = useMemo(
    () => countDocWords(draft.title, draft.sapo, draft.content),
    [draft.title, draft.sapo, draft.content],
  );

  const title = postId ? (vi?.title ? `Sửa: ${vi.title}` : 'Sửa bài viết') : 'Viết bài mới';

  if (busy === 'load') {
    return (
      <div className="flex grow shrink-0 flex-col bg-slate-50 min-h-full">
        <div className="h-16 px-6 bg-white border-b border-slate-300 flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
        <AdminPageBody className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="bg-white rounded-xl border border-slate-300 p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-6 w-72 rounded" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-[460px] w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl border border-slate-300" />
            <Skeleton className="h-60 w-full rounded-xl border border-slate-300" />
            <Skeleton className="h-52 w-full rounded-xl border border-slate-300" />
          </div>
        </AdminPageBody>
      </div>
    );
  }

  const tabErrors = errors[tab] ?? {};
  const viLive = vi?.status === 'PUBLISHED' || vi?.status === 'SCHEDULED';
  const status = post?.translations[tab]?.status ?? null;

  return (
    <div className="flex grow shrink-0 flex-col bg-slate-50 min-h-full">
      {/* ── TOP ACTION BAR (STICKY) ── */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 bg-white border-b border-slate-300 flex items-center justify-between gap-3 shadow-2xs">
        {/* Left: Quay lại & Tiêu đề bài & Trạng thái */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#5F8A03] hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            title="Quay lại danh sách bài viết"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Quay lại danh sách</span>
          </Link>

          <span className="w-px h-5 bg-slate-200 shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-2 min-w-0">
            <StatusBadge status={status} />
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[240px] md:max-w-md hidden md:block" title={draft.title || title}>
              {draft.title || (postId ? 'Sửa bài viết' : 'Viết bài mới')}
            </h1>
          </div>
        </div>

        {/* Center: Chuyển ngôn ngữ WAI-ARIA & Bộ đếm từ */}
        <div className="hidden lg:flex items-center gap-3.5 mx-3">
          <LocaleTabs
            panelId={PANEL_ID}
            active={tab}
            onChange={setTab}
            tabs={[
              { locale: 'vi', label: 'Tiếng Việt', dirty: dirtyLocales.includes('vi') },
              { locale: 'en', label: en ? 'Tiếng Anh' : 'Tiếng Anh (chưa có)', dirty: dirtyLocales.includes('en') },
            ]}
          />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 tabular-nums px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300">
            <PenLine size={12} className="text-slate-400" aria-hidden="true" />
            <span>{words.toLocaleString('vi-VN')} từ</span>
            <span className="text-slate-300">·</span>
            <span>~{minutes} phút đọc</span>
          </div>
        </div>

        {/* Right: Thao tác chính: Viết AI + Lưu nháp + Xuất bản */}
        <div className="flex items-center gap-2 shrink-0">
          {tab === 'vi' && (
            <button
              type="button"
              onClick={openWriter}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7CB305]/50 bg-[#F4F9E8] hover:bg-[#EAF3D6] text-[#5F8A03] text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>Viết cùng AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={(!isDirty && !!post) || busy !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            disabled={busy !== null || (tab === 'en' && !viLive)}
            onClick={() => handlePublish()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-remak-orange hover:bg-remak-orange-dark text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {busy === 'publish' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>{status === 'PUBLISHED' ? 'Cập nhật' : 'Xuất bản'}</span>
          </button>
        </div>
      </header>

      {/* Sub-bar cho Mobile & Tablet */}
      <div className="lg:hidden px-4 py-2 border-b border-slate-300 flex items-center justify-between gap-2 bg-white">
        <LocaleTabs
          panelId={PANEL_ID}
          active={tab}
          onChange={setTab}
          tabs={[
            { locale: 'vi', label: 'Tiếng Việt', dirty: dirtyLocales.includes('vi') },
            { locale: 'en', label: en ? 'Tiếng Anh' : 'Tiếng Anh (chưa có)', dirty: dirtyLocales.includes('en') },
          ]}
        />
        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
          {words} từ · ~{minutes} ph
        </span>
      </div>

      {/* ── NỘI DUNG CHÍNH ── */}
      <AdminPageBody>
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-700">
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          {/* ── CỘT TRÁI: BÀI VIẾT LIỀN MẠCH (CANVAS) ── */}
          <section role="tabpanel" id={PANEL_ID} aria-labelledby={`tab-${tab}`} lang={tab} className="space-y-4 min-w-0">
            {tab === 'en' && !en && (
              <Notice tone="brand">
                <span className="font-bold">Bài chưa có bản tiếng Anh.</span> Bạn có thể bấm <strong className="text-[#365002]">“Dịch bằng AI”</strong> để Gemini dịch tự động toàn bài, hoặc bấm <strong className="text-[#365002]">“Chép bản Việt để tự dịch”</strong> để tự biên tập.
              </Notice>
            )}
            {tab === 'en' && enStale && (
              <Notice tone="warning">
                Bản tiếng Việt đã sửa sau lần dịch gần nhất — hãy cập nhật bản tiếng Anh cho khớp.{' '}
                <button type="button" className="font-bold underline cursor-pointer" onClick={() => setDrafts((d) => ({ ...d, en: { ...d.en, sourceUpdatedAt: vi!.contentUpdatedAt } }))}>
                  Đánh dấu đã cập nhật
                </button>
              </Notice>
            )}
            {tab === 'en' && (
              <div className="rounded-xl border border-[#7CB305]/40 bg-gradient-to-r from-[#F4F9E8] to-white px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#5F8A03]" aria-hidden="true" /> Dịch tự động bằng AI (Gemini)
                  </p>
                  <p className="mt-0.5">Dịch cả tiêu đề, sapo, nội dung, alt/chú thích ảnh và SEO; giữ nguyên ảnh, bảng, video, link. Điền trực tiếp vào form — bạn duyệt rồi mới lưu.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={copyViToEn} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
                    <Copy size={13} aria-hidden="true" /> Chép bản Việt để tự dịch
                  </button>
                  <button type="button" onClick={runAiTranslate} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50">
                    {busy === 'ai' ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {busy === 'ai' ? 'Đang dịch…' : en ? 'Dịch lại bằng AI' : 'Dịch bằng AI'}
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
            {tab === 'en' && (drafts.vi.title || vi) && (
              <ViReference
                title={drafts.vi.title || vi?.title || ''}
                sapo={drafts.vi.sapo || vi?.sapo}
                slug={drafts.vi.slug || vi?.slug}
                readingMinutes={vi?.readingMinutes}
              />
            )}

            {/* KHỐI SOẠN THẢO BÀI VIẾT TẬP TRUNG */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
              {/* Tiêu đề & Permalink & Sapo */}
              <div className="p-5 sm:p-7 space-y-4">
                {/* 1. Tiêu đề */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="post-title" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                      Tiêu đề bài viết <span className="text-rose-500">*</span>
                      {isAi('title') && <AiBadge />}
                    </label>
                    <span className={`text-[11px] font-semibold tabular-nums ${draft.title.length > 100 ? 'text-amber-600' : draft.title.length === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                      {draft.title.length}/100 ký tự
                    </span>
                  </div>
                  <textarea
                    id="post-title"
                    rows={2}
                    value={draft.title}
                    maxLength={200}
                    onChange={(e) => setDraft({ title: e.target.value.replace(/\n/g, ' ') })}
                    placeholder={tab === 'vi' ? 'Nhập tiêu đề bài viết cuốn hút (nên từ 60–100 ký tự)…' : 'English article title…'}
                    aria-invalid={!!tabErrors.title}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 text-lg sm:text-xl font-bold text-slate-900 bg-white placeholder:text-slate-300 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-colors leading-snug resize-none"
                  />
                  {tabErrors.title && (
                    <p role="alert" className="text-xs font-semibold text-rose-600">{tabErrors.title}</p>
                  )}
                </div>

                {/* 2. Đường dẫn (Slug) nhỏ gọn tinh tế */}
                <div className="pt-0.5">
                  <SlugField
                    key={`${tab}-${post?.translations[tab]?.slug ?? 'new'}`}
                    value={draft.slug}
                    onChange={(slug) => setDraft({ slug })}
                    sourceText={draft.title}
                    prefix={tab === 'vi' ? 'remak.vn/tin-tuc/' : 'remak.vn/en/news/'}
                    autoFromSource={!post?.translations[tab]?.slug}
                    published={!!post?.translations[tab]?.firstPublishedAt}
                    checkAvailable={checkSlug}
                    compact
                  />
                </div>

                {/* 3. Sapo */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="post-sapo" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                      Sapo (Đoạn mở đầu in đậm)
                      {isAi('sapo') && <AiBadge />}
                    </label>
                    <span className={`text-[11px] font-semibold tabular-nums ${draft.sapo.length > 600 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {draft.sapo.length}/600
                    </span>
                  </div>
                  <textarea
                    id="post-sapo"
                    rows={3}
                    value={draft.sapo}
                    maxLength={600}
                    onChange={(e) => setDraft({ sapo: e.target.value })}
                    placeholder="Tóm tắt 1–3 câu nội dung chính, xuất hiện ở đầu bài và làm mô tả khi chia sẻ link mạng xã hội…"
                    aria-invalid={!!tabErrors.sapo}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 text-xs sm:text-sm font-semibold text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-colors leading-relaxed resize-none"
                  />
                  {tabErrors.sapo && (
                    <p role="alert" className="text-xs font-semibold text-rose-600">{tabErrors.sapo}</p>
                  )}
                </div>
              </div>

              {/* 4. TipTap RichTextEditor embedded */}
              <div className="border-t border-slate-300">
                {tab === 'vi' && aiWriting && (
                  <div aria-live="polite" className="px-5 py-2 bg-[#F4F9E8] border-b border-[#7CB305]/30 flex items-center gap-2 text-xs font-semibold text-[#4E7202]">
                    <Loader2 size={13} className="animate-spin shrink-0" aria-hidden="true" />
                    <span>AI đang viết bài — trình soạn thảo tạm khoá, nội dung sẽ xuất hiện ngay sau đây…</span>
                  </div>
                )}
                <RichTextEditor
                  key={tab}
                  editable={!(tab === 'vi' && aiWriting)}
                  value={draft.content}
                  onChange={onContentChange}
                  onUploadImage={async (file) => (await uploadContentImage(file)).url}
                  currentPostId={post?.id}
                  ariaLabel={`Nội dung bài viết (${LOCALE_LABEL[tab]})`}
                  embedded
                />
                {tabErrors.content && (
                  <p role="alert" className="p-4 text-xs font-semibold text-rose-600 border-t border-rose-200 bg-rose-50">{tabErrors.content}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── CỘT PHẢI: CÀI ĐẶT BÀI VIẾT (SETTINGS PANELS) ── */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            {/* Panel 1: Xuất bản & Lịch trình */}
            <Panel title="Xuất bản & Lịch trình" icon={Send}>
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

            {/* Panel 2: Phân loại & Định danh */}
            <Panel title="Phân loại & Định danh" icon={FolderTree}>
              <Field label="Chuyên mục *" ai={!!aiFilled.categoryId && meta.categoryId === aiFilled.categoryId}>
                {(id) => (
                  <select
                    id={id}
                    value={meta.categoryId}
                    onChange={(e) => {
                      categoryTouched.current = true;
                      setMeta((m) => ({ ...m, categoryId: e.target.value }));
                    }}
                    className={inputClass}
                  >
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
                <span className="text-xs font-bold text-slate-700">Tag chủ đề</span>
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

              <div className="pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" className="accent-[#5F8A03] rounded" checked={meta.isFeatured} onChange={(e) => setMeta((m) => ({ ...m, isFeatured: e.target.checked }))} />
                  <Star size={13} className="text-amber-500 fill-amber-500" aria-hidden="true" />
                  <span>Bài nổi bật (hiển thị trang chủ & khối tiêu điểm)</span>
                </label>
              </div>
            </Panel>

            {/* Panel 3: Ảnh đại diện */}
            <Panel title="Ảnh đại diện (Cover)" icon={ImageIcon}>
              <ImageUploadField
                label="Ảnh bìa bài viết"
                currentUrl={post?.cover?.url}
                file={coverFile}
                onPick={setCoverFile}
                onClear={() => setCoverFile(null)}
                uploading={busy === 'save' && coverFile !== null}
                hint="Nên dùng ảnh ngang tỉ lệ 16:9 (≥ 1200×630px) để hiển thị sắc nét trên Zalo/Facebook."
              />
              <Field label={`Mô tả ảnh (Alt text, ${LOCALE_LABEL[tab]}) *`} error={tabErrors.coverAlt} ai={isAi('coverAlt')}>
                {(id) => (
                  <input id={id} value={draft.coverAlt} maxLength={300} onChange={(e) => setDraft({ coverAlt: e.target.value })} placeholder="Mô tả nội dung ảnh cho người khiếm thị & Google" aria-invalid={!!tabErrors.coverAlt} className={inputClass} />
                )}
              </Field>
              <Field label={`Chú thích ảnh (${LOCALE_LABEL[tab]})`}>
                {(id) => <input id={id} value={draft.coverCaption} maxLength={500} onChange={(e) => setDraft({ coverCaption: e.target.value })} placeholder="Chú thích hiển thị dưới ảnh (tuỳ chọn)" className={inputClass} />}
              </Field>
            </Panel>

            {/* Panel 4: Chấm điểm SEO / AEO / GEO */}
            <Panel title={`Chấm điểm SEO · AEO · GEO (${LOCALE_LABEL[tab]})`} icon={BarChart3}>
              <ContentScorePanel
                keyword={draft.focusKeyword}
                keywordFromAi={isAi('focusKeyword')}
                onKeywordChange={(focusKeyword) => setDraft({ focusKeyword })}
                input={{
                  title: draft.title,
                  slug: draft.slug,
                  sapo: draft.sapo,
                  seoTitle: draft.seoTitle,
                  seoDescription: draft.seoDescription,
                  doc: draft.content,
                  locale: tab,
                  author: scoreAuthor,
                  publishedAt: post?.translations[tab]?.publishedAt ?? null,
                  updatedAt: post?.translations[tab]?.contentUpdatedAt ?? null,
                  fanOutQueries: tab === 'vi' && fanOut.length ? fanOut : undefined,
                }}
              />
            </Panel>

            {/* Lượt xem & người đọc (chỉ khi bản ngôn ngữ này đã từng xuất bản) */}
            {post?.translations[tab]?.firstPublishedAt && (
              <Panel title={`Lượt xem & người đọc (${LOCALE_LABEL[tab]})`} icon={Eye} collapsible>
                <NewsStatsPanel postId={post.id} locale={tab} />
              </Panel>
            )}

            {/* Panel 5: Cài đặt nâng cao (SEO Google & Nguồn tin) */}
            <Panel title={`Tùy chọn nâng cao (${LOCALE_LABEL[tab]})`} icon={SlidersHorizontal} collapsible>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-2">Thẻ SEO Google (Meta Title & Description)</h3>
                  <SeoPanel
                    url={`remak.vn${tab === 'vi' ? '/tin-tuc/' : '/en/news/'}${draft.slug || '...'}`}
                    seoTitle={draft.seoTitle}
                    seoDescription={draft.seoDescription}
                    fallbackTitle={draft.title}
                    fallbackDescription={draft.sapo}
                    noindex={draft.noindex}
                    aiFilled={{ seoTitle: isAi('seoTitle'), seoDescription: isAi('seoDescription') }}
                    onChange={(p) => setDraft(p)}
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">Trích dẫn nguồn tin</h3>
                  <Field label="Tên nguồn (vd: Báo Xây Dựng)">
                    {(id) => <input id={id} value={draft.sourceName} maxLength={120} onChange={(e) => setDraft({ sourceName: e.target.value })} placeholder="Tên cơ quan / báo chí trích dẫn" className={inputClass} />}
                  </Field>
                  <Field label="Link bài gốc" error={tabErrors.sourceUrl}>
                    {(id) => <input id={id} value={draft.sourceUrl} maxLength={500} onChange={(e) => setDraft({ sourceUrl: e.target.value })} placeholder="https://…" aria-invalid={!!tabErrors.sourceUrl} className={inputClass} />}
                  </Field>
                </div>
              </div>
            </Panel>
          </aside>
        </div>

        <AiWriterPanel open={writerOpen} onClose={() => setWriterOpen(false)} host={writerHost} />

        <AiTranslateDialog
          open={aiState !== null}
          state={aiState}
          onCancel={() => aiAbort.current?.abort()}
          onClose={() => setAiState(null)}
          onRetry={() => void startAiTranslate()}
          onCopySource={copyViToEn}
        />

        {/* Floating Save Pill khi có thay đổi chưa lưu */}
        {isDirty && (
          <aside aria-label="Lưu nhanh bài viết" className="sticky bottom-4 z-20 mx-auto max-w-fit bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-700 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <TriangleAlert size={13} aria-hidden="true" />
              <span>Chưa lưu</span>
            </span>
            <span className="w-px h-3.5 bg-slate-700" aria-hidden="true" />
            <button
              type="button"
              onClick={discard}
              disabled={busy !== null}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy !== null}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {busy === 'save' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              <span>Lưu ngay</span>
            </button>
          </aside>
        )}
      </AdminPageBody>
    </div>
  );
}

// ── Thành phần nhỏ ─────────────────────────────────────────────────────────

function Panel({
  title,
  icon: Icon,
  children,
  collapsible,
  defaultOpen = false,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  if (collapsible) {
    return (
      <details className="group bg-white rounded-xl border border-slate-300 shadow-2xs focus-within:z-20 relative" open={defaultOpen}>
        <summary className="flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-800 bg-slate-50/60 hover:bg-slate-50 cursor-pointer list-none border-b border-transparent group-open:border-slate-200 transition-colors select-none rounded-t-xl">
          <span className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-[#5F8A03]" aria-hidden="true" />}
            {title}
          </span>
          <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="p-4 space-y-3">{children}</div>
      </details>
    );
  }
  return (
    <section className="bg-white rounded-xl border border-slate-300 shadow-2xs focus-within:z-20 relative">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 rounded-t-xl">
        <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[#5F8A03]" aria-hidden="true" />}
          {title}
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  ai,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  /** Ô do AI điền, người dùng chưa sửa */
  ai?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        {label}
        {ai && <AiBadge />}
      </label>
      {children(id)}
      {error ? <p role="alert" className="text-[11px] font-semibold text-rose-600">{error}</p> : hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Notice({ tone, children }: { tone: 'brand' | 'info' | 'warning'; children: React.ReactNode }) {
  const isBrand = tone === 'brand' || tone === 'info';
  const isWarning = tone === 'warning';

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs leading-relaxed flex items-start gap-2.5 ${
        isBrand
          ? 'border-[#7CB305]/50 bg-[#F4F9E8] text-[#2D4402]'
          : isWarning
          ? 'border-amber-300 bg-amber-50/80 text-amber-900'
          : 'border-sky-300 bg-sky-50/80 text-sky-900'
      }`}
    >
      {isBrand ? (
        <Info size={16} className="text-[#5F8A03] shrink-0 mt-0.5" aria-hidden="true" />
      ) : isWarning ? (
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <Info size={16} className="text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/** Bản tiếng Việt để đối chiếu khi dịch (thu gọn được) */
function ViReference({
  title,
  sapo,
  slug,
  readingMinutes,
}: {
  title: string;
  sapo?: string;
  slug?: string;
  readingMinutes?: number;
}) {
  if (!title) return null;
  return (
    <details className="group rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
      <summary className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/60 hover:bg-slate-50 cursor-pointer list-none select-none">
        <span className="flex items-center gap-1.5">
          <FileText size={13} className="text-[#5F8A03]" aria-hidden="true" />
          Bản tiếng Việt để đối chiếu khi dịch
        </span>
        <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div lang="vi" className="p-4 space-y-2 text-sm text-slate-700 border-t border-slate-200">
        <p className="text-base font-bold text-slate-900">{title}</p>
        {sapo && <p className="font-semibold text-slate-700 text-xs sm:text-sm leading-relaxed">{sapo}</p>}
        <p className="text-[11px] text-slate-500 tabular-nums">
          {readingMinutes ? `${readingMinutes} phút đọc` : ''}
          {slug ? `${readingMinutes ? ' · ' : ''}đường dẫn /tin-tuc/${slug}` : ''}
        </p>
      </div>
    </details>
  );
}
