'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, Copy, Info, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import { HERO_ACCENT_STYLES } from '@/components/home/HomeHeroSection';
import type { HeroContent, HomeHero } from '@/types/homepage';
import TranslatableField from '@/cms/components/shared/TranslatableField';
import TranslatePickerDialog from '@/cms/components/shared/TranslatePickerDialog';
import { describeAiError, type AiErrorInfo } from '@/cms/components/shared/ai-error';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import { apiFetch, ApiError } from '@/cms/lib/api-client';
import {
  copyViToEnDraft,
  getDraftField,
  setDraftField,
  translatableEntries,
  translationGroups,
  type HeroTranslationDraft,
} from './hero-form';

interface HeroEnFormProps {
  /** Bản gốc tiếng Việt để đối chiếu */
  vi: HeroContent;
  draft: HeroTranslationDraft;
  setDraft: React.Dispatch<React.SetStateAction<HeroTranslationDraft>>;
  image: HomeHero['image'];
  previewUrl?: string;
  errors: Record<string, string>;
  /** Bộ lọc "chỉ hiện trường chưa dịch" */
  visibleKeys: Set<string> | null;
}

const cardStyle = 'bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4';

function SharedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-normal">
      <Info size={13} className="shrink-0 mt-0.5 text-slate-400" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export default function HeroEnForm({ vi, draft, setDraft, image, previewUrl, errors, visibleKeys }: HeroEnFormProps) {
  const show = (key: string, source: string) => source.trim() !== '' && (!visibleKeys || visibleKeys.has(key));

  const set = <K extends keyof HeroTranslationDraft>(key: K, value: HeroTranslationDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  const setCta = (key: 'primaryCta' | 'secondaryCta', patch: Partial<HeroTranslationDraft['primaryCta']>) =>
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  const setStat = (index: number, patch: Partial<HeroTranslationDraft['stats'][number]>) =>
    setDraft((prev) => ({ ...prev, stats: prev.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  const setMedia = (patch: Partial<HeroTranslationDraft['media']>) =>
    setDraft((prev) => ({ ...prev, media: { ...prev.media, ...patch } }));

  const confirm = useConfirm();
  const showToast = useToast();
  const [translating, setTranslating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // Giá trị AI vừa điền theo khoá ô; nhãn "AI dịch" hiện tới khi người dùng sửa ô đó
  const [aiValues, setAiValues] = useState<Record<string, string>>({});
  const abortRef = useRef<AbortController | null>(null);
  const isAi = (key: string) => aiValues[key] !== undefined && getDraftField(draft, key) === aiValues[key];

  /** Phương án dự phòng (hành vi cũ): chép nguyên văn tiếng Việt để tự sửa */
  const copyVerbatim = () => {
    setDraft(copyViToEnDraft(vi));
    setAiValues({});
    setAiError(null);
  };

  const [pickerOpen, setPickerOpen] = useState(false);

  /** Bấm "Sao chép tất cả từ tiếng Việt" -> mở dialog chọn ô (mặc định không tích ô nào) */
  const handleCopyAllFromVi = () => setPickerOpen(true);

  /**
   * Dịch đúng các ô đã tích: gửi tiếng Việt của các ô đó lên API -> Gemini -> ghi đè CHỈ các ô đó.
   * Ô không tích giữ nguyên. Không tự lưu: người dùng kiểm tra rồi bấm Lưu.
   */
  const runTranslate = async (keys: string[]) => {
    const sources = new Map(translatableEntries(vi, draft).map((e) => [e.key, e.source]));
    const fields = Object.fromEntries(keys.filter((k) => sources.has(k)).map((k) => [k, sources.get(k)!]));
    if (!Object.keys(fields).length) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setTranslating(true);
    setAiError(null);
    let failure: AiErrorInfo | null = null;
    try {
      const res = await apiFetch<{ fields: Record<string, string> }>('/translate', {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({ source: 'vi', target: 'en', context: 'homepage-hero', fields }),
      });
      setDraft((prev) => Object.entries(res.fields).reduce((d, [key, value]) => setDraftField(d, key, value), prev));
      // Gộp với nhãn "AI dịch" của các lần trước (ô không dịch lần này giữ nguyên nhãn cũ)
      setAiValues((prev) => ({ ...prev, ...res.fields }));
      showToast(`Đã dịch ${Object.keys(res.fields).length} ô — kiểm tra lại trước khi lưu`, 'success');
    } catch (err) {
      if (controller.signal.aborted) {
        showToast('Đã huỷ dịch tự động', 'info');
      } else {
        failure = describeAiError(err instanceof ApiError ? err.status : 0, err instanceof Error ? err.message : '');
        // Khung báo lỗi vẫn ở lại sau khi đóng dialog để tham chiếu / chép nguyên văn
        setAiError(failure.message);
      }
    } finally {
      abortRef.current = null;
      setTranslating(false);
    }

    // Hiện dialog lỗi sau khi đã thoát trạng thái "đang dịch"
    if (failure) {
      const accepted = await confirm({
        title: failure.title,
        description: failure.message,
        confirmText: failure.action === 'retry' ? 'Thử lại' : 'Chép nguyên văn tiếng Việt',
        cancelText: 'Đóng',
        variant: 'warning',
      });
      if (!accepted) return;
      // "Thử lại" dịch lại đúng tập ô đã chọn, không mở lại dialog chọn
      if (failure.action === 'retry') await runTranslate(keys);
      else copyVerbatim();
    }
  };

  const handleClearAllTranslations = () => {
    setAiValues({});
    setDraft({
      title: '',
      subtitle: '',
      paragraphs: vi.paragraphs.map(() => ''),
      primaryCta: { text: '', link: '' },
      secondaryCta: { text: '', link: '' },
      stats: vi.stats.map(() => ({ value: '', label: '', sublabel: '' })),
      media: { frameTitle: '', badge: '', alt: '' },
    });
  };

  const textKeys: [string, string][] = [
    ['title', vi.title],
    ['subtitle', vi.subtitle],
    ...vi.paragraphs.map((p, i): [string, string] => [`paragraphs.${i}`, p]),
  ];
  const ctaKeys: [string, string][] = [
    ['primaryCta.text', vi.primaryCta.text],
    ['primaryCta.link', vi.primaryCta.link],
    ...(vi.secondaryCta
      ? ([
          ['secondaryCta.text', vi.secondaryCta.text],
          ['secondaryCta.link', vi.secondaryCta.link],
        ] as [string, string][])
      : []),
  ];
  const statKeys: [string, string][] = vi.stats.flatMap((s, i): [string, string][] => [
    [`stats.${i}.value`, s.value],
    [`stats.${i}.label`, s.label],
    [`stats.${i}.sublabel`, s.sublabel],
  ]);
  const mediaKeys: [string, string][] = [
    ['media.alt', vi.media.alt],
    ['media.frameTitle', vi.media.frameTitle],
    ['media.badge', vi.media.badge],
  ];

  const anyVisible = (keys: [string, string][]) => keys.some(([k, src]) => show(k, src));

  if (visibleKeys && visibleKeys.size === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-300 text-center text-sm text-slate-600 font-sans">
        Tất cả các trường đã được dịch sang tiếng Anh.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      
      {pickerOpen && (
        <TranslatePickerDialog
          groups={translationGroups(vi, draft)}
          onClose={() => setPickerOpen(false)}
          onConfirm={(keys) => {
            setPickerOpen(false);
            void runTranslate(keys);
          }}
        />
      )}

      {/* THANH CÔNG CỤ NHANH BẢN DỊCH */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-300 shadow-2xs flex-wrap">
        <div className="text-xs font-bold text-slate-900">
          Bản dịch tiếng Anh
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyAllFromVi()}
            disabled={translating}
            aria-busy={translating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7CB305]/50 bg-[#F4F9E8] text-xs font-bold text-[#5F8A03] hover:bg-[#5F8A03] hover:text-white transition-all cursor-pointer shadow-2xs disabled:cursor-wait disabled:hover:bg-[#F4F9E8] disabled:hover:text-[#5F8A03]"
            title="Chọn các ô cần dịch từ tiếng Việt sang tiếng Anh bằng AI (Gemini); ô không chọn giữ nguyên"
          >
            {translating ? (
              <>
                <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Đang dịch bằng AI, vui lòng đợi…
              </>
            ) : (
              <>
                <Sparkles size={13} aria-hidden="true" /> Sao chép tất cả từ Tếng Việt
              </>
            )}
          </button>
          {translating && (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <X size={12} aria-hidden="true" /> Huỷ
            </button>
          )}
          <button
            type="button"
            onClick={handleClearAllTranslations}
            disabled={translating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-all cursor-pointer"
            title="Xóa toàn bộ bản dịch tiếng Anh"
          >
            <RotateCcw size={12} /> Đặt lại trống
          </button>
        </div>
      </div>

      {aiError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1">
            <strong className="font-bold">Không dịch tự động được:</strong> {aiError}
          </span>
          <button
            type="button"
            onClick={copyVerbatim}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-700 font-semibold hover:bg-rose-100 cursor-pointer"
          >
            <Copy size={12} aria-hidden="true" /> Chỉ chép nguyên văn tiếng Việt
          </button>
        </div>
      )}

      {/* Khoá nhập trong lúc AI đang dịch để không bị ghi đè chữ đang gõ */}
      <fieldset disabled={translating} aria-busy={translating} className="contents">
      <div className="space-y-6 font-sans">
        
        {/* HÀNG 1: LƯỚI 2 CỘT CÂN BẰNG CHIỀU CAO (TIÊU ĐỀ/MÔ TẢ vs ẢNH SẢN PHẨM) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* KHỐI 1: TIÊU ĐỀ & MÔ TẢ (ENGLISH) */}
          {anyVisible(textKeys) && (
            <div className={`${cardStyle} flex flex-col justify-between h-full`}>
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Tiêu Đề & Nội Dung Mô Tả
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {show('title', vi.title) && (
                    <TranslatableField
                      label="Tiêu đề chính"
                      source={vi.title}
                      value={draft.title}
                      aiFilled={isAi('title')}
                      onChange={(v) => set('title', v)}
                      maxLength={120}
                    />
                  )}
                  {show('subtitle', vi.subtitle) && (
                    <TranslatableField
                      label="Tiêu đề phụ"
                      source={vi.subtitle}
                      value={draft.subtitle}
                      aiFilled={isAi('subtitle')}
                      onChange={(v) => set('subtitle', v)}
                      maxLength={160}
                    />
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  {vi.paragraphs.map(
                    (p, i) =>
                      show(`paragraphs.${i}`, p) && (
                        <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-300">
                          <TranslatableField
                            label={`Đoạn mô tả ${i + 1}`}
                            source={p}
                            value={draft.paragraphs[i] ?? ''}
                            aiFilled={isAi(`paragraphs.${i}`)}
                            onChange={(v) =>
                              set(
                                'paragraphs',
                                vi.paragraphs.map((_, j) => (j === i ? v : (draft.paragraphs[j] ?? ''))),
                              )
                            }
                            multiline
                            maxLength={600}
                          />
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KHỐI 2: ẢNH SẢN PHẨM & NHÃN KHUNG (BẰNG VỚI KHỐI TIÊU ĐỀ & MÔ TẢ) */}
          {anyVisible(mediaKeys) && (
            <div className={`${cardStyle} flex flex-col justify-between h-full`}>
              <div className="space-y-3.5">
                <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Ảnh Sản Phẩm & Nhãn Khung
                  </h4>
                </div>

                {/* TIÊU ĐỀ KHUNG & NHÃN CÔNG NGHỆ (ĐẶT Ở TRÊN KHỐI ẢNH) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {show('media.frameTitle', vi.media.frameTitle) && (
                    <TranslatableField
                      label="Tiêu đề khung"
                      source={vi.media.frameTitle}
                      value={draft.media.frameTitle}
                      aiFilled={isAi('media.frameTitle')}
                      onChange={(v) => setMedia({ frameTitle: v })}
                      maxLength={60}
                    />
                  )}
                  {show('media.badge', vi.media.badge) && (
                    <TranslatableField
                      label="Nhãn công nghệ"
                      source={vi.media.badge}
                      value={draft.media.badge}
                      aiFilled={isAi('media.badge')}
                      onChange={(v) => setMedia({ badge: v })}
                      maxLength={40}
                    />
                  )}
                </div>

                {/* KHUNG GIẢ LẬP HIỂN THỊ ẢNH */}
                <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 space-y-2">
                  {(draft.media.frameTitle || vi.media.frameTitle || draft.media.badge || vi.media.badge) && (
                    <div className="flex items-center justify-between gap-2 px-1">
                      <span className="text-xs font-bold text-slate-800 tracking-wide uppercase truncate">
                        {draft.media.frameTitle || vi.media.frameTitle || 'Cấu Trúc Tấm MGO Thực Tế'}
                      </span>
                      {(draft.media.badge || vi.media.badge) && (
                        <span className="text-[10px] font-bold text-remak-green-dark bg-remak-green-light border border-remak-green/30 px-2 py-0.5 rounded-full shrink-0">
                          {draft.media.badge || vi.media.badge}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative w-full h-72 sm:h-80 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 flex items-center justify-center shadow-2xs">
                    {(previewUrl || image) ? (
                      <img
                        src={previewUrl ?? image?.imageUrl}
                        alt={draft.media.alt || vi.media.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400 text-xs">Chưa có ảnh sản phẩm</div>
                    )}
                  </div>
                </div>

                <SharedNote>
                  Tệp ảnh được dùng chung cho cả 2 ngôn ngữ. Bạn chỉ cần dịch Tiêu đề khung, Nhãn công nghệ và Mô tả Alt SEO sang tiếng Anh.
                </SharedNote>
              </div>

              {/* MÔ TẢ ẢNH (ALT SEO) */}
              {show('media.alt', vi.media.alt) && (
                <div className="pt-1">
                  <TranslatableField
                    label="Mô tả ảnh"
                    source={vi.media.alt}
                    value={draft.media.alt}
                    aiFilled={isAi('media.alt')}
                    onChange={(v) => setMedia({ alt: v })}
                    maxLength={200}
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* HÀNG 2: NÚT KÊU GỌI HÀNH ĐỘNG (CTA) TOÀN CHIỀU RỘNG */}
        {anyVisible(ctaKeys) && (
          <div className={cardStyle}>
            <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Nút Kêu Gọi Hành Động
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-orange-50/40 border border-orange-300 space-y-3">
                <span className="text-xs font-bold text-[#EA580C]">Nút chính</span>
                {show('primaryCta.text', vi.primaryCta.text) && (
                  <TranslatableField
                    label="Chữ trên nút"
                    source={vi.primaryCta.text}
                    value={draft.primaryCta.text}
                    aiFilled={isAi('primaryCta.text')}
                    onChange={(v) => setCta('primaryCta', { text: v })}
                    maxLength={40}
                  />
                )}
                {show('primaryCta.link', vi.primaryCta.link) && (
                  <TranslatableField
                    label="Đường dẫn"
                    source={vi.primaryCta.link}
                    value={draft.primaryCta.link}
                    aiFilled={isAi('primaryCta.link')}
                    onChange={(v) => setCta('primaryCta', { link: v })}
                    maxLength={300}
                    error={errors['en.primaryCta.link']}
                  />
                )}
              </div>

              {vi.secondaryCta && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 space-y-3">
                  <span className="text-xs font-semibold text-slate-800">Nút phụ</span>
                  {show('secondaryCta.text', vi.secondaryCta.text) && (
                    <TranslatableField
                      label="Chữ trên nút"
                      source={vi.secondaryCta.text}
                      value={draft.secondaryCta.text}
                      aiFilled={isAi('secondaryCta.text')}
                      onChange={(v) => setCta('secondaryCta', { text: v })}
                      maxLength={40}
                    />
                  )}
                  {show('secondaryCta.link', vi.secondaryCta.link) && (
                    <TranslatableField
                      label="Đường dẫn"
                      source={vi.secondaryCta.link}
                      value={draft.secondaryCta.link}
                      aiFilled={isAi('secondaryCta.link')}
                      onChange={(v) => setCta('secondaryCta', { link: v })}
                      maxLength={300}
                      error={errors['en.secondaryCta.link']}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HÀNG 3: 4 KHỐI THÔNG SỐ (TOÀN CHIỀU RỘNG, DÀN HÀNG NGANG 4 CỘT ĐỀU NHAU) */}
        {anyVisible(statKeys) && (
          <div className={cardStyle}>
            <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-3 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                4 Khối Thông Số Kỹ Thuật
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vi.stats.map((s, i) => {
                const keys = statKeys.slice(i * 3, i * 3 + 3);
                if (!anyVisible(keys)) return null;
                const currentStyle = HERO_ACCENT_STYLES[s.accent] ?? HERO_ACCENT_STYLES.slate;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-300 bg-white hover:border-[#5F8A03] hover:shadow-xs transition-colors space-y-3 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Khối #{i + 1}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <span className={`w-3 h-3 rounded-full ${currentStyle.swatch}`} aria-hidden="true" />
                        Màu {currentStyle.label.toLowerCase()}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      {show(`stats.${i}.value`, s.value) && (
                        <TranslatableField
                          label="Số liệu"
                          source={s.value}
                          value={draft.stats[i]?.value ?? ''}
                          aiFilled={isAi(`stats.${i}.value`)}
                          onChange={(v) => setStat(i, { value: v })}
                          maxLength={16}
                        />
                      )}
                      {show(`stats.${i}.label`, s.label) && (
                        <TranslatableField
                          label="Tiêu đề"
                          source={s.label}
                          value={draft.stats[i]?.label ?? ''}
                          aiFilled={isAi(`stats.${i}.label`)}
                          onChange={(v) => setStat(i, { label: v })}
                          maxLength={40}
                        />
                      )}
                      {show(`stats.${i}.sublabel`, s.sublabel) && (
                        <TranslatableField
                          label="Mô tả phụ"
                          source={s.sublabel}
                          value={draft.stats[i]?.sublabel ?? ''}
                          aiFilled={isAi(`stats.${i}.sublabel`)}
                          onChange={(v) => setStat(i, { sublabel: v })}
                          maxLength={60}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      </fieldset>

    </div>
  );
}
