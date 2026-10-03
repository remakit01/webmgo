'use client';

import React from 'react';
import { Copy, Info, RotateCcw } from 'lucide-react';
import { HERO_ACCENT_STYLES } from '@/components/home/HomeHeroSection';
import type { HeroContent, HomeHero } from '@/types/homepage';
import TranslatableField from './TranslatableField';
import { copyViToEnDraft, type HeroTranslationDraft } from './hero-form';

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

const cardStyle = 'bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4';

function SharedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-normal">
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

  const handleCopyAllFromVi = () => {
    setDraft(copyViToEnDraft(vi));
  };

  const handleClearAllTranslations = () => {
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
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-sm text-slate-600 font-sans">
        Tất cả các trường đã được dịch sang tiếng Anh.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      
      {/* THANH CÔNG CỤ NHANH BẢN DỊCH */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex-wrap">
        <div className="text-xs font-black text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5F8A03]" />
          <span>Bản dịch tiếng Anh (English)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAllFromVi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#7CB305]/50 bg-[#F4F9E8] text-xs font-bold text-[#5F8A03] hover:bg-[#5F8A03] hover:text-white transition-all cursor-pointer shadow-2xs"
            title="Chép toàn bộ tiêu đề, số liệu và link từ bản tiếng Việt để chỉnh sửa nhanh"
          >
            <Copy size={13} /> Sao chép tất cả từ tiếng Việt
          </button>
          <button
            type="button"
            onClick={handleClearAllTranslations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-all cursor-pointer"
            title="Xóa toàn bộ bản dịch tiếng Anh"
          >
            <RotateCcw size={12} /> Đặt lại trống
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* CỘT TRÁI: TIÊU ĐỀ, MÔ TẢ & NÚT */}
        <div className="space-y-6 flex flex-col">
          
          {/* CARD 1: TIÊU ĐỀ & MÔ TẢ */}
          {anyVisible(textKeys) && (
            <div className={cardStyle}>
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#5F8A03]" />
                  Tiêu Đề & Nội Dung (English)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {show('title', vi.title) && (
                  <TranslatableField
                    label="Tiêu đề chính"
                    source={vi.title}
                    value={draft.title}
                    onChange={(v) => set('title', v)}
                    maxLength={120}
                  />
                )}
                {show('subtitle', vi.subtitle) && (
                  <TranslatableField
                    label="Tiêu đề phụ"
                    source={vi.subtitle}
                    value={draft.subtitle}
                    onChange={(v) => set('subtitle', v)}
                    maxLength={160}
                  />
                )}
              </div>

              <div className="space-y-3 pt-1">
                {vi.paragraphs.map(
                  (p, i) =>
                    show(`paragraphs.${i}`, p) && (
                      <div key={i} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                        <TranslatableField
                          label={`Đoạn mô tả ${i + 1}`}
                          source={p}
                          value={draft.paragraphs[i] ?? ''}
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
          )}

          {/* CARD 2: NÚT KÊU GỌI HÀNH ĐỘNG */}
          {anyVisible(ctaKeys) && (
            <div className={cardStyle}>
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#F26522]" />
                  Nút Kêu Gọi Hành Động (CTA)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-orange-50/30 border-2 border-orange-200/80 space-y-3">
                  <span className="text-xs font-black text-[#EA580C]">Nút chính (Cam Remak)</span>
                  {show('primaryCta.text', vi.primaryCta.text) && (
                    <TranslatableField
                      label="Chữ trên nút"
                      source={vi.primaryCta.text}
                      value={draft.primaryCta.text}
                      onChange={(v) => setCta('primaryCta', { text: v })}
                      maxLength={40}
                    />
                  )}
                  {show('primaryCta.link', vi.primaryCta.link) && (
                    <TranslatableField
                      label="Đường dẫn"
                      source={vi.primaryCta.link}
                      value={draft.primaryCta.link}
                      onChange={(v) => setCta('primaryCta', { link: v })}
                      maxLength={300}
                      error={errors['en.primaryCta.link']}
                    />
                  )}
                </div>

                {vi.secondaryCta && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800">Nút phụ (Trắng viền)</span>
                    {show('secondaryCta.text', vi.secondaryCta.text) && (
                      <TranslatableField
                        label="Chữ trên nút"
                        source={vi.secondaryCta.text}
                        value={draft.secondaryCta.text}
                        onChange={(v) => setCta('secondaryCta', { text: v })}
                        maxLength={40}
                      />
                    )}
                    {show('secondaryCta.link', vi.secondaryCta.link) && (
                      <TranslatableField
                        label="Đường dẫn"
                        source={vi.secondaryCta.link}
                        value={draft.secondaryCta.link}
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

        </div>

        {/* CỘT PHẢI: ẢNH SẢN PHẨM & 4 KHỐI THÔNG SỐ (2X2 GRID ĐỒNG ĐỀU) */}
        <div className="space-y-6 flex flex-col">
          
          {/* CARD 3: ẢNH SẢN PHẨM & NHÃN KHUNG */}
          {anyVisible(mediaKeys) && (
            <div className={cardStyle}>
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#7CB305]" />
                  Ảnh Sản Phẩm & Nhãn Khung
                </h4>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
                  {(previewUrl || image) && (
                    <img src={previewUrl ?? image?.imageUrl} alt={draft.media.alt || vi.media.alt} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-normal">Ảnh dùng chung cả 2 ngôn ngữ. Bạn chỉ cần dịch mô tả ảnh và nhãn.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {show('media.frameTitle', vi.media.frameTitle) && (
                  <TranslatableField
                    label="Tiêu đề khung"
                    source={vi.media.frameTitle}
                    value={draft.media.frameTitle}
                    onChange={(v) => setMedia({ frameTitle: v })}
                    maxLength={60}
                  />
                )}
                {show('media.badge', vi.media.badge) && (
                  <TranslatableField
                    label="Nhãn công nghệ"
                    source={vi.media.badge}
                    value={draft.media.badge}
                    onChange={(v) => setMedia({ badge: v })}
                    maxLength={40}
                  />
                )}
              </div>

              {show('media.alt', vi.media.alt) && (
                <TranslatableField
                  label="Mô tả ảnh (Alt SEO)"
                  source={vi.media.alt}
                  value={draft.media.alt}
                  onChange={(v) => setMedia({ alt: v })}
                  maxLength={200}
                />
              )}
            </div>
          )}

          {/* CARD 4: 4 KHỐI THÔNG SỐ (LƯỚI 2X2 ĐỒNG ĐỀU) */}
          {anyVisible(statKeys) && (
            <div className={cardStyle}>
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#5F8A03]" />
                  4 Khối Thông Số Kỹ Thuật (Lưới 2×2)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {vi.stats.map((s, i) => {
                  const keys = statKeys.slice(i * 3, i * 3 + 3);
                  if (!anyVisible(keys)) return null;
                  const currentStyle = HERO_ACCENT_STYLES[s.accent] ?? HERO_ACCENT_STYLES.slate;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-800">Khối #{i + 1}</span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <span className={`w-3 h-3 rounded-full ${currentStyle.swatch}`} aria-hidden="true" />
                          Màu {currentStyle.label.toLowerCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {show(`stats.${i}.value`, s.value) && (
                          <TranslatableField
                            label="Số liệu"
                            source={s.value}
                            value={draft.stats[i]?.value ?? ''}
                            onChange={(v) => setStat(i, { value: v })}
                            maxLength={16}
                          />
                        )}
                        {show(`stats.${i}.label`, s.label) && (
                          <TranslatableField
                            label="Tiêu đề"
                            source={s.label}
                            value={draft.stats[i]?.label ?? ''}
                            onChange={(v) => setStat(i, { label: v })}
                            maxLength={40}
                          />
                        )}
                        {show(`stats.${i}.sublabel`, s.sublabel) && (
                          <TranslatableField
                            label="Mô tả phụ"
                            source={s.sublabel}
                            value={draft.stats[i]?.sublabel ?? ''}
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

      </div>

    </div>
  );
}
