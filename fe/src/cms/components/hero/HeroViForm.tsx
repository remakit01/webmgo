'use client';

import React from 'react';
import { AlertCircle, Check, ImageIcon, Plus, Trash2, UploadCloud } from 'lucide-react';
import { HERO_ACCENT_STYLES } from '@/components/home/HomeHeroSection';
import { HERO_ACCENTS, type HeroContent, type HeroCta, type HomeHero } from '@/types/homepage';
import { HERO_IMAGE_MIN_WIDTH, MAX_PARAGRAPHS, inputClass } from './hero-form';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-400 font-normal">{hint}</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
      <AlertCircle size={12} aria-hidden="true" /> {message}
    </p>
  );
}

interface HeroViFormProps {
  draft: HeroContent;
  setDraft: React.Dispatch<React.SetStateAction<HeroContent>>;
  /** Ảnh đã lưu trên máy chủ (dùng chung 2 ngôn ngữ) */
  image: HomeHero['image'];
  file: File | null;
  previewUrl?: string;
  fileError: string | null;
  onPickFile: (file: File) => void;
  onDiscardFile: () => void;
  /** Lỗi theo khoá ô, vd { 'primaryCta.link': '...' } */
  errors: Record<string, string>;
}

export default function HeroViForm({
  draft,
  setDraft,
  image,
  file,
  previewUrl,
  fileError,
  onPickFile,
  onDiscardFile,
  errors,
}: HeroViFormProps) {
  const update = <K extends keyof HeroContent>(key: K, value: HeroContent[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const updateCta = (key: 'primaryCta' | 'secondaryCta', patch: Partial<HeroCta>) =>
    setDraft((prev) => ({ ...prev, [key]: { text: '', link: '', ...prev[key], ...patch } }));

  const updateStat = (index: number, patch: Partial<HeroContent['stats'][number]>) =>
    setDraft((prev) => ({ ...prev, stats: prev.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));

  const updateParagraph = (index: number, value: string) =>
    setDraft((prev) => ({ ...prev, paragraphs: prev.paragraphs.map((p, i) => (i === index ? value : p)) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start font-sans">
      
      {/* CỘT TRÁI: TIÊU ĐỀ, MÔ TẢ & NÚT HÀNH ĐỘNG */}
      <div className="space-y-6 flex flex-col">
        
        {/* CARD 1: TIÊU ĐỀ & MÔ TẢ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#5F8A03]" />
              Tiêu Đề & Nội Dung Mô Tả
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tiêu đề chính *">
              <input
                required
                maxLength={120}
                placeholder="Tấm Chống Cháy MGO Remak®"
                value={draft.title}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Tiêu đề phụ (màu xanh Remak)">
              <input
                maxLength={160}
                placeholder="Bảo vệ kết cấu PCCC chuyên sâu"
                value={draft.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="space-y-3 pt-1">
            {draft.paragraphs.map((p, i) => (
              <div key={i} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Đoạn mô tả {i + 1} *</span>
                  {draft.paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => update('paragraphs', draft.paragraphs.filter((_, j) => j !== i))}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} /> Xoá đoạn
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={600}
                  value={p}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                  className={`${inputClass} leading-relaxed`}
                />
              </div>
            ))}

            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-normal">
                Bao chữ bằng <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">**hai dấu sao**</code> để in đậm chữ, ví dụ <code className="px-1.5 py-0.5 rounded bg-[#F4F9E8] text-[#5F8A03] font-bold">**1.200°C**</code>
              </span>
              {draft.paragraphs.length < MAX_PARAGRAPHS && (
                <button
                  type="button"
                  onClick={() => update('paragraphs', [...draft.paragraphs, ''])}
                  className="px-3 py-1.5 rounded-xl border border-[#7CB305]/50 bg-[#F4F9E8] text-xs font-bold text-[#5F8A03] hover:bg-[#5F8A03] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus size={13} /> Thêm đoạn ({draft.paragraphs.length}/{MAX_PARAGRAPHS})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: NÚT KÊU GỌI HÀNH ĐỘNG (CTA) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#F26522]" />
              Nút Kêu Gọi Hành Động (CTA)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nút chính */}
            <div className="p-3.5 rounded-xl bg-orange-50/30 border-2 border-orange-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#EA580C]">Nút chính (Cam Remak) *</span>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Bắt buộc</span>
              </div>
              <input
                required
                maxLength={40}
                placeholder="Nhận Mẫu Thử Miễn Phí"
                value={draft.primaryCta.text}
                onChange={(e) => updateCta('primaryCta', { text: e.target.value })}
                className={inputClass}
              />
              <input
                required
                maxLength={300}
                placeholder="/nhan-mau-thu"
                aria-label="Đường dẫn nút chính"
                aria-invalid={errors['primaryCta.link'] ? true : undefined}
                value={draft.primaryCta.link}
                onChange={(e) => updateCta('primaryCta', { link: e.target.value })}
                className={inputClass}
              />
              <FieldError message={errors['primaryCta.link']} />
            </div>

            {/* Nút phụ */}
            <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Nút phụ (Trắng viền)</span>
                {/* Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.secondaryCta !== null}
                  onClick={() => update('secondaryCta', draft.secondaryCta ? null : { text: 'Dự Toán Khối Lượng (m²)', link: '#du-toan-vat-tu' })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    draft.secondaryCta ? 'bg-[#5F8A03]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      draft.secondaryCta ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {draft.secondaryCta ? (
                <>
                  <input
                    required
                    maxLength={40}
                    placeholder="Dự Toán Khối Lượng (m²)"
                    value={draft.secondaryCta.text}
                    onChange={(e) => updateCta('secondaryCta', { text: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    required
                    maxLength={300}
                    placeholder="#du-toan-vat-tu"
                    aria-label="Đường dẫn nút phụ"
                    aria-invalid={errors['secondaryCta.link'] ? true : undefined}
                    value={draft.secondaryCta.link}
                    onChange={(e) => updateCta('secondaryCta', { link: e.target.value })}
                    className={inputClass}
                  />
                  <FieldError message={errors['secondaryCta.link']} />
                </>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  Nút phụ đang tắt. Bật công tắc để hiển thị nút phụ trên trang chủ.
                </div>
              )}
            </div>

          </div>

          <p className="text-[11px] text-slate-400 font-normal">
            Quy chuẩn liên kết: Trang nội bộ bắt đầu bằng <code className="text-slate-600 font-bold">/</code> (vd: <code className="text-slate-600">/nhan-mau-thu</code>), cuộn trang bằng <code className="text-slate-600 font-bold">#</code> (vd: <code className="text-slate-600">#du-toan-vat-tu</code>), web ngoài bắt đầu bằng <code className="text-slate-600 font-bold">https://</code>.
          </p>
        </div>

      </div>

      {/* CỘT PHẢI: ẢNH SẢN PHẨM & 4 KHỐI THÔNG SỐ (2X2 GRID ĐỒNG ĐỀU) */}
      <div className="space-y-6 flex flex-col">
        
        {/* CARD 3: ẢNH SẢN PHẨM & NHÃN KHUNG */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#7CB305]" />
              Ảnh Sản Phẩm & Khung Trình Diễn
            </h4>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 flex items-center justify-center relative shadow-2xs">
              {previewUrl || image ? (
                <img
                  src={previewUrl ?? image?.imageUrl}
                  alt={draft.media.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={22} className="text-slate-400" />
              )}
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#7CB305]/40 bg-[#F4F9E8] hover:bg-[#5F8A03] hover:text-white text-xs font-bold text-[#5F8A03] transition-all cursor-pointer shadow-2xs">
                  <UploadCloud size={14} />
                  {image || file ? 'Thay ảnh khác' : 'Tải ảnh sản phẩm'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    onChange={(e) => {
                      const picked = e.target.files?.[0];
                      if (picked) onPickFile(picked);
                      e.target.value = '';
                    }}
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={onDiscardFile}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
                  >
                    Bỏ ảnh vừa chọn
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Hỗ trợ JPEG/PNG/WebP/AVIF, tối đa 10MB. Rộng tối thiểu {HERO_IMAGE_MIN_WIDTH}px.
              </p>
            </div>
          </div>

          {fileError && (
            <p role="alert" className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
              {fileError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Field label="Tiêu đề khung (trên ảnh)">
              <input
                maxLength={60}
                placeholder="Cấu Trúc Tấm MGO Thực Tế"
                value={draft.media.frameTitle}
                onChange={(e) => update('media', { ...draft.media, frameTitle: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Nhãn công nghệ (badge xanh)">
              <input
                maxLength={40}
                placeholder="Công Nghệ Sulfate"
                value={draft.media.badge}
                onChange={(e) => update('media', { ...draft.media, badge: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Mô tả ảnh (Alt SEO) *" hint="Mô tả trực quan để công cụ tìm kiếm và người khiếm thị hiểu ảnh">
            <input
              required
              maxLength={200}
              placeholder="Tấm chống cháy MGO Remak kết cấu sợi lưới thủy tinh đa tầng"
              value={draft.media.alt}
              onChange={(e) => update('media', { ...draft.media, alt: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        {/* CARD 4: 4 KHỐI THÔNG SỐ (LƯỚI 2X2 ĐỒNG ĐỀU) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#5F8A03]" />
              4 Khối Thông Số Kỹ Thuật (Lưới 2×2)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {draft.stats.map((stat, i) => {
              const currentStyle = HERO_ACCENT_STYLES[stat.accent] ?? HERO_ACCENT_STYLES.slate;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-800">Khối #{i + 1}</span>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1" role="radiogroup" aria-label={`Màu nhấn khối ${i + 1}`}>
                      {HERO_ACCENTS.map((accent) => (
                        <button
                          key={accent}
                          type="button"
                          role="radio"
                          aria-checked={stat.accent === accent}
                          title={`Màu ${HERO_ACCENT_STYLES[accent].label}`}
                          onClick={() => updateStat(i, { accent })}
                          className={`w-4.5 h-4.5 rounded-full ${HERO_ACCENT_STYLES[accent].swatch} flex items-center justify-center cursor-pointer transition-transform ${
                            stat.accent === accent ? 'ring-2 ring-slate-800 ring-offset-1 scale-110' : 'opacity-50 hover:opacity-100'
                          }`}
                        >
                          {stat.accent === accent && <Check size={10} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      required
                      maxLength={16}
                      placeholder="Số liệu (1.200°C)"
                      value={stat.value}
                      onChange={(e) => updateStat(i, { value: e.target.value })}
                      className={`${inputClass} font-black text-sm ${currentStyle.value} tabular-nums`}
                    />
                    <input
                      required
                      maxLength={40}
                      placeholder="Tiêu đề (Chịu nhiệt)"
                      value={stat.label}
                      onChange={(e) => updateStat(i, { label: e.target.value })}
                      className={`${inputClass} font-bold`}
                    />
                    <input
                      maxLength={60}
                      placeholder="Mô tả phụ (Chống cháy A1)"
                      value={stat.sublabel}
                      onChange={(e) => updateStat(i, { sublabel: e.target.value })}
                      className={`${inputClass} text-slate-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
