'use client';

import React from 'react';
import { AlertCircle, Check, ImageIcon, Plus, Trash2, UploadCloud } from 'lucide-react';
import { HERO_ACCENT_STYLES } from '@/components/home/HomeHeroSection';
import { HERO_ACCENTS, type HeroContent, type HeroCta, type HomeHero } from '@/types/homepage';
import { HERO_IMAGE_MIN_WIDTH, MAX_PARAGRAPHS, inputClass } from './hero-form';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500 font-normal">{hint}</span>}
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
    <div className="space-y-6 font-sans">
      
      {/* HÀNG 1: LƯỚI 2 CỘT CÂN BẰNG NHAU (TIÊU ĐỀ & MÔ TẢ vs ẢNH SẢN PHẨM SHOWCASE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* KHỐI 1: TIÊU ĐỀ & NỘI DUNG MÔ TẢ */}
        <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900">
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
                <div key={i} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Đoạn mô tả {i + 1} *</span>
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
                  Định dạng in đậm bằng <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">**hai dấu sao**</code>, ví dụ <code className="px-1.5 py-0.5 rounded bg-[#F4F9E8] text-[#5F8A03] font-bold">**1.200°C**</code>
                </span>
                {draft.paragraphs.length < MAX_PARAGRAPHS && (
                  <button
                    type="button"
                    onClick={() => update('paragraphs', [...draft.paragraphs, ''])}
                    className="px-3 py-1.5 rounded-lg border border-[#7CB305]/50 bg-[#F4F9E8] text-xs font-bold text-[#5F8A03] hover:bg-[#5F8A03] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus size={13} /> Thêm đoạn ({draft.paragraphs.length}/{MAX_PARAGRAPHS})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: ẢNH SẢN PHẨM & KHUNG TRÌNH DIỄN (BẰNG VỚI KHỐI TIÊU ĐỀ & MÔ TẢ) */}
        <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-3.5">
            <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Ảnh Sản Phẩm & Khung Trình Diễn
              </h4>
            </div>

            {/* TIÊU ĐỀ KHUNG & NHÃN CÔNG NGHỆ (ĐẶT Ở TRÊN KHỐI ẢNH) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* KHUNG GIẢ LẬP HIỂN THỊ ẢNH THỰC TẾ TRỰC QUAN */}
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 space-y-2">
              {(draft.media.frameTitle || draft.media.badge) && (
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="text-xs font-bold text-slate-800 tracking-wide uppercase truncate">
                    {draft.media.frameTitle || 'Cấu Trúc Tấm MGO Thực Tế'}
                  </span>
                  {draft.media.badge && (
                    <span className="text-[10px] font-bold text-remak-green-dark bg-remak-green-light border border-remak-green/30 px-2 py-0.5 rounded-full shrink-0">
                      {draft.media.badge}
                    </span>
                  )}
                </div>
              )}

              <div className="relative w-full h-52 sm:h-56 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 flex items-center justify-center group shadow-2xs">
                {previewUrl || image ? (
                  <img
                    src={previewUrl ?? image?.imageUrl}
                    alt={draft.media.alt || 'Ảnh sản phẩm'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400 flex flex-col items-center gap-1.5">
                    <ImageIcon size={32} className="text-slate-300" />
                    <span className="text-xs font-medium">Chưa có ảnh sản phẩm</span>
                  </div>
                )}
              </div>
            </div>

            {/* NÚT THAY / TẢI ẢNH FULL WIDTH */}
            <div className="space-y-1.5 pt-0.5">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:border-slate-400 text-xs font-bold transition-all cursor-pointer shadow-2xs">
                <UploadCloud size={16} />
                <span>{image || file ? 'Thay ảnh sản phẩm khác' : 'Tải ảnh sản phẩm lên'}</span>
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onDiscardFile}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
                  >
                    Bỏ ảnh vừa chọn
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-400 font-normal text-center">
                JPEG/PNG/WebP/AVIF, tối đa 10MB · Chiều rộng tối thiểu {HERO_IMAGE_MIN_WIDTH}px
              </p>
            </div>

            {fileError && (
              <p role="alert" className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                {fileError}
              </p>
            )}
          </div>

          {/* MÔ TẢ ẢNH (ALT SEO) - THIẾT KẾ VỪA VẶN */}
          <div className="pt-2 border-t border-slate-200 mt-0.5">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-700">Mô tả ảnh</span>
              <input
                required
                maxLength={200}
                placeholder="Tấm chống cháy MGO Remak kết cấu sợi lưới thủy tinh đa tầng"
                value={draft.media.alt}
                onChange={(e) => update('media', { ...draft.media, alt: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
        </div>

      </div>

      {/* HÀNG 2: NÚT KÊU GỌI HÀNH ĐỘNG (CTA) TOÀN CHIỀU RỘNG */}
      <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4">
        <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">
            Nút Kêu Gọi Hành Động
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Nút chính */}
          <div className="p-3.5 rounded-lg bg-orange-50/40 border border-orange-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#EA580C]">Nút chính</span>
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
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Nút phụ</span>
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
      </div>

      {/* HÀNG 3: 4 KHỐI THÔNG SỐ KỸ THUẬT (TOÀN CHIỀU RỘNG, DÀN HÀNG NGANG 4 CỘT ĐỀU NHAU) */}
      <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4">
        <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between gap-3 flex-wrap">
          <h4 className="text-sm font-bold text-slate-900">
            4 Khối Thông Số Kỹ Thuật
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {draft.stats.map((stat, i) => {
            const currentStyle = HERO_ACCENT_STYLES[stat.accent] ?? HERO_ACCENT_STYLES.slate;
            return (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-300 bg-white hover:border-[#5F8A03] hover:shadow-xs transition-colors space-y-3 shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Khối #{i + 1}
                  </span>
                  {/* Bộ chọn màu Brand Remak */}
                  <div className="flex items-center gap-1.5" role="radiogroup" aria-label={`Màu nhấn khối ${i + 1}`}>
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

                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-600">Số liệu nổi bật *</label>
                    <input
                      required
                      maxLength={16}
                      placeholder="1.200°C"
                      value={stat.value}
                      onChange={(e) => updateStat(i, { value: e.target.value })}
                      className={`${inputClass} font-black text-base ${currentStyle.value} tabular-nums`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-600">Tiêu đề thông số *</label>
                    <input
                      required
                      maxLength={40}
                      placeholder="Chịu nhiệt"
                      value={stat.label}
                      onChange={(e) => updateStat(i, { label: e.target.value })}
                      className={`${inputClass} font-bold text-slate-800`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-500">Mô tả phụ</label>
                    <input
                      maxLength={60}
                      placeholder="Chống cháy chuẩn A1"
                      value={stat.sublabel}
                      onChange={(e) => updateStat(i, { sublabel: e.target.value })}
                      className={`${inputClass} text-slate-500`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
