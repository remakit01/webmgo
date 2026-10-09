'use client';

import React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Star, Trash2 } from 'lucide-react';
import {
  PRICE_MODES,
  SALE_UNIT_LABEL,
  SALE_UNITS,
  STOCK_STATUS_LABEL,
  STOCK_STATUSES,
  emptyVariantInput,
  formatFireRating,
  weightMismatch,
  type MechanicalSpecs,
  type ProductVariantInput,
} from '@remak/shared/contracts/product';
import IconAction from '@/cms/components/shared/IconAction';
import { NumberField, Section, SelectField, Switch, TextField, baseInputClass, labelClass } from './fields';
import { blankToNull, fieldId, formatVnd } from './product-form';

const PRICE_MODE_LABEL = { FIXED: 'Giá niêm yết', CONTACT: 'Liên hệ báo giá' } as const;
const STOCK_TONE: Record<string, string> = {
  IN_STOCK: 'border-[#7CB305]/60 bg-[#F4F9E8] text-[#3F5E02]',
  LIMITED: 'border-amber-300 bg-amber-50 text-amber-900',
  PRE_ORDER: 'border-sky-300 bg-sky-50 text-sky-900',
  BACK_ORDER: 'border-sky-300 bg-sky-50 text-sky-900',
  OUT_OF_STOCK: 'border-rose-300 bg-rose-50 text-rose-900',
  DISCONTINUED: 'border-slate-300 bg-slate-100 text-slate-800',
};

const num = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n);

/**
 * Độ dày (biến thể) của dòng tấm: bảng tóm tắt + mở từng dòng để sửa đủ trường.
 * Đổi thứ tự bằng ▲ ▼; chọn 1 độ dày mặc định; cảnh báo khi kg/tấm lệch > 15% so với tỷ trọng dòng.
 */
export default function ProductVariantsSection({
  variants,
  onChange,
  mechanical,
  expanded,
  onExpand,
  errors,
}: {
  variants: ProductVariantInput[];
  onChange: (v: ProductVariantInput[]) => void;
  mechanical: MechanicalSpecs;
  expanded: number | null;
  onExpand: (i: number | null) => void;
  errors: Record<string, string>;
}) {
  const setAt = (i: number, patch: Partial<ProductVariantInput>) => onChange(variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const setDefault = (i: number) => onChange(variants.map((v, j) => ({ ...v, isDefault: j === i })));
  const move = (i: number, d: -1 | 1) => {
    const next = [...variants];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    if (expanded === i) onExpand(i + d);
    else if (expanded === i + d) onExpand(i);
  };
  const remove = (i: number) => {
    onChange(variants.filter((_, j) => j !== i));
    onExpand(null);
  };
  const add = (from?: ProductVariantInput) => {
    const base = from
      ? { ...from, id: null, sku: null, isDefault: false, thicknessMm: from.thicknessMm + 1 }
      : { ...emptyVariantInput(variants.length ? Math.max(...variants.map((v) => v.thicknessMm)) + 2 : 8), isDefault: variants.length === 0 };
    onChange([...variants, base]);
    onExpand(variants.length);
  };

  return (
    <Section
      id="variants"
      title="Độ dày & giá"
      description="Mỗi dòng là một độ dày bán ra: khổ tấm, khối lượng, giới hạn chịu lửa EI, giá và tình trạng hàng."
      actions={
        <button
          type="button"
          onClick={() => add()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 text-xs font-bold text-white hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E7202] shadow-sm transition-colors"
        >
          <Plus size={14} aria-hidden="true" /> Thêm độ dày
        </button>
      }
    >
      {errors.variants && (
        <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800">
          {errors.variants}
        </p>
      )}
      {variants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
          Chưa có độ dày nào. Trang sản phẩm sẽ không có bảng quy cách và giá.
        </p>
      ) : (
        <div className="overflow-clip rounded-xl border border-slate-300 bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Độ dày của sản phẩm, theo thứ tự hiển thị</caption>
            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 select-none">
              <tr>
                <th scope="col" className="w-24 px-3.5 py-3">Thứ tự</th>
                <th scope="col" className="px-3.5 py-3">Độ dày · khổ</th>
                <th scope="col" className="px-3.5 py-3 text-right">Khối lượng</th>
                <th scope="col" className="px-3.5 py-3">Chịu lửa</th>
                <th scope="col" className="px-3.5 py-3">Giá</th>
                <th scope="col" className="px-3.5 py-3">Tình trạng</th>
                <th scope="col" className="w-20 px-3.5 py-3 text-center">Mặc định</th>
                <th scope="col" className="w-28 px-3.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            {variants.map((v, i) => {
              const open = expanded === i;
              const mismatch = weightMismatch(v, mechanical);
              const rowErrors = Object.keys(errors).filter((k) => k.startsWith(`variants.${i}.`));
              const name = `${num(v.thicknessMm)}mm`;
              const panelId = `variant-panel-${i}`;
              return (
                <tbody key={v.id ?? `new-${i}`} className="border-t border-slate-200 first-of-type:border-t-0">
                  <tr className={`align-middle transition-colors ${open ? 'bg-[#F4F9E8]/90 font-medium' : 'hover:bg-slate-50/90'} ${v.isActive ? '' : 'text-slate-500'}`}>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-0.5">
                        <IconAction label={`Chuyển ${name} lên`} icon={ArrowUp} disabled={i === 0} onClick={() => move(i, -1)} />
                        <IconAction label={`Chuyển ${name} xuống`} icon={ArrowDown} disabled={i === variants.length - 1} onClick={() => move(i, 1)} />
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => onExpand(open ? null : i)}
                        className="group inline-flex items-center gap-1.5 rounded text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4E7202]"
                      >
                        <ChevronDown size={16} className={`shrink-0 text-slate-700 transition-transform motion-reduce:transition-none ${open ? 'rotate-180 text-[#4E7202]' : ''}`} aria-hidden="true" />
                        <span>
                          <span className="block font-bold text-slate-900 group-hover:underline">{name}</span>
                          <span className="block text-xs font-medium tabular-nums text-slate-600">
                            {v.widthMm}×{v.lengthMm} mm{v.sku && ` · ${v.sku}`}
                          </span>
                        </span>
                      </button>
                      {!v.isActive && <span className="ml-6 mt-0.5 inline-block rounded border border-slate-300 bg-slate-100 px-1.5 text-xs font-bold text-slate-700">Đang ẩn</span>}
                      {rowErrors.length > 0 && <span className="ml-6 mt-0.5 block text-xs font-bold text-rose-700">{rowErrors.length} lỗi — mở để sửa</span>}
                    </td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                      {v.weightKg != null ? (
                        <span className="inline-flex items-center gap-1">
                          {mismatch && <AlertTriangle size={14} className="text-amber-600" aria-label="Khối lượng lệch so với tỷ trọng" />}
                          {num(v.weightKg)} kg
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-xs font-bold text-slate-800">
                      {v.fireRatingLabel || formatFireRating(v.fireRatingMinMinutes, v.fireRatingMaxMinutes) || <span className="font-normal text-slate-400">Chưa thử nghiệm</span>}
                    </td>
                    <td className="px-3.5 py-2.5 text-xs tabular-nums">
                      {v.priceMode === 'FIXED' && v.priceVnd != null ? (
                        <span className="font-bold text-slate-900">
                          {formatVnd(v.priceVnd)}/{SALE_UNIT_LABEL[v.saleUnit].vi}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-600">Liên hệ</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-bold shadow-2xs ${STOCK_TONE[v.stockStatus]}`}>
                        {STOCK_STATUS_LABEL[v.stockStatus].vi}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <input
                        type="radio"
                        name="variant-default"
                        checked={v.isDefault}
                        onChange={() => setDefault(i)}
                        aria-label={`Chọn ${name} làm độ dày mặc định`}
                        className="h-4 w-4 cursor-pointer accent-[#4E7202] focus-visible:ring-2 focus-visible:ring-[#4E7202]"
                      />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconAction label={`Nhân bản ${name}`} icon={Copy} onClick={() => add(v)} />
                        <IconAction label={`Xoá ${name}`} icon={Trash2} danger onClick={() => remove(i)} tipAlign="end" />
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={8} id={panelId} className="border-t-2 border-[#4E7202]/30 bg-slate-50/70 p-4">
                        <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs space-y-6">
                          <VariantEditor v={v} i={i} set={(patch) => setAt(i, patch)} errors={errors} mismatch={mismatch} />
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </table>
        </div>
      )}
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <Star size={13} className="text-amber-500 shrink-0" aria-hidden="true" /> Độ dày mặc định được chọn sẵn trên trang sản phẩm và dùng cho giá trong dữ liệu Google.
      </p>
    </Section>
  );
}

function VariantEditor({
  v,
  i,
  set,
  errors,
  mismatch,
}: {
  v: ProductVariantInput;
  i: number;
  set: (patch: Partial<ProductVariantInput>) => void;
  errors: Record<string, string>;
  mismatch: { expectedKg: number; ratio: number } | null;
}) {
  const p = (f: string) => `variants.${i}.${f}`;
  const setTr = (l: 'vi' | 'en', patch: { label?: string | null; recommendedUse?: string | null }) => {
    const cur = v.translations[l] ?? { label: null, recommendedUse: null };
    set({ translations: { ...v.translations, [l]: { ...cur, ...patch } } });
  };
  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
          Quy cách
        </legend>
        <div className="grid grid-cols-4 items-start gap-3.5">
          <NumberField path={p('thicknessMm')} label="Độ dày" unit="mm" required value={v.thicknessMm} onChange={(n) => set({ thicknessMm: n ?? 0 })} errors={errors} />
          <NumberField path={p('widthMm')} label="Rộng" unit="mm" integer required value={v.widthMm} onChange={(n) => set({ widthMm: n ?? 0 })} errors={errors} />
          <NumberField path={p('lengthMm')} label="Dài" unit="mm" integer required value={v.lengthMm} onChange={(n) => set({ lengthMm: n ?? 0 })} errors={errors} />
          <TextField path={p('sku')} label="Mã SKU" mono value={v.sku ?? ''} onChange={(s) => set({ sku: blankToNull(s) })} errors={errors} />
          <NumberField path={p('weightKg')} label="Khối lượng / tấm" unit="kg" value={v.weightKg} onChange={(weightKg) => set({ weightKg })} errors={errors} />
          <NumberField path={p('densityKgM3')} label="Tỷ trọng riêng" unit="kg/m³" hint="Bỏ trống = theo tỷ trọng của dòng." value={v.densityKgM3} onChange={(densityKgM3) => set({ densityKgM3 })} errors={errors} />
          <NumberField path={p('flexuralMinMpa')} label="Cường độ uốn ≥" unit="MPa" value={v.flexuralMinMpa} onChange={(flexuralMinMpa) => set({ flexuralMinMpa })} errors={errors} />
        </div>
        {mismatch && (
          <p role="status" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
            <span>
              {num(v.weightKg!)} kg lệch {Math.round(mismatch.ratio * 100)}% so với ~{num(mismatch.expectedKg)} kg tính từ tỷ trọng. Kiểm tra lại khối lượng hoặc tỷ trọng trước khi xuất bản.
            </span>
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
          Chịu lửa
        </legend>
        <div className="grid grid-cols-4 items-start gap-3.5">
          <NumberField path={p('fireRatingMinMinutes')} label="EI từ" unit="phút" integer value={v.fireRatingMinMinutes} onChange={(n) => set({ fireRatingMinMinutes: n })} errors={errors} />
          <NumberField path={p('fireRatingMaxMinutes')} label="EI đến" unit="phút" integer value={v.fireRatingMaxMinutes} onChange={(n) => set({ fireRatingMaxMinutes: n })} errors={errors} />
          <TextField
            path={p('fireRatingLabel')}
            label="Nhãn hiển thị"
            className="col-span-2"
            placeholder={formatFireRating(v.fireRatingMinMinutes, v.fireRatingMaxMinutes) ?? 'vd EI 45 – EI 60'}
            hint="Bỏ trống = tự ghi từ số phút. Chưa thử nghiệm thì để trống cả hai ô EI."
            value={v.fireRatingLabel ?? ''}
            onChange={(s) => set({ fireRatingLabel: blankToNull(s) })}
            errors={errors}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
          Giá & tình trạng hàng
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cách hiển thị giá">
          {PRICE_MODES.map((m) => (
            <label
              key={m}
              className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#4E7202] ${
                v.priceMode === m
                  ? 'border-[#4E7202] bg-[#F4F9E8] text-[#3F5E02] shadow-xs ring-1 ring-[#4E7202]/20'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name={`price-mode-${i}`}
                value={m}
                checked={v.priceMode === m}
                onChange={() => set(m === 'CONTACT' ? { priceMode: m, priceVnd: null, compareAtPriceVnd: null } : { priceMode: m })}
                className="sr-only"
              />
              {PRICE_MODE_LABEL[m]}
            </label>
          ))}
        </div>
        {v.priceMode === 'FIXED' && (
          <div className="grid grid-cols-4 items-start gap-3.5">
            <NumberField
              path={p('priceVnd')}
              label="Giá bán"
              unit="đ"
              integer
              required
              hint={v.priceVnd ? formatVnd(v.priceVnd) : undefined}
              value={v.priceVnd}
              onChange={(priceVnd) => set({ priceVnd })}
              errors={errors}
            />
            <NumberField
              path={p('compareAtPriceVnd')}
              label="Giá gốc (gạch ngang)"
              unit="đ"
              integer
              hint={v.compareAtPriceVnd ? formatVnd(v.compareAtPriceVnd) : 'Bỏ trống nếu không giảm giá.'}
              value={v.compareAtPriceVnd}
              onChange={(compareAtPriceVnd) => set({ compareAtPriceVnd })}
              errors={errors}
            />
            <SelectField path={p('saleUnit')} label="Đơn vị tính" emptyLabel={null} value={v.saleUnit} options={SALE_UNITS.map((u) => ({ value: u, label: `/ ${SALE_UNIT_LABEL[u].vi}` }))} onChange={(u) => u && set({ saleUnit: u })} errors={errors} />
            <div className="space-y-1">
              <label htmlFor={fieldId(p('priceValidUntil'))} className={labelClass}>
                Giá áp dụng đến
              </label>
              <input
                id={fieldId(p('priceValidUntil'))}
                type="date"
                value={v.priceValidUntil ?? ''}
                onChange={(e) => set({ priceValidUntil: e.target.value || null })}
                className={baseInputClass}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 items-start gap-3.5">
          <SelectField
            path={p('stockStatus')}
            label="Tình trạng hàng"
            emptyLabel={null}
            value={v.stockStatus}
            options={STOCK_STATUSES.map((s) => ({ value: s, label: STOCK_STATUS_LABEL[s].vi }))}
            onChange={(s) => s && set({ stockStatus: s })}
            errors={errors}
            hint={v.stockStatus === 'DISCONTINUED' ? 'Ngừng KD: ẩn giá trên web.' : undefined}
          />
          <NumberField path={p('leadTimeDays')} label="Thời gian giao" unit="ngày" integer value={v.leadTimeDays} onChange={(leadTimeDays) => set({ leadTimeDays })} errors={errors} />
          <NumberField path={p('minOrderQty')} label="Đặt tối thiểu" unit={SALE_UNIT_LABEL[v.saleUnit].vi} integer value={v.minOrderQty} onChange={(minOrderQty) => set({ minOrderQty })} errors={errors} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
          Nhãn & khuyến nghị ứng dụng
        </legend>
        <div className="grid grid-cols-2 items-start gap-3.5">
          {(['vi', 'en'] as const).map((l) => (
            <div key={l} className="space-y-3 rounded-xl border border-slate-300 bg-slate-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                {l === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
              </p>
              <TextField
                path={p(`translations.${l}.label`)}
                label="Nhãn"
                placeholder={l === 'vi' ? `Tấm ${num(v.thicknessMm)}mm` : `${num(v.thicknessMm)}mm board`}
                value={v.translations[l]?.label ?? ''}
                onChange={(s) => setTr(l, { label: blankToNull(s) })}
              />
              <TextField
                path={p(`translations.${l}.recommendedUse`)}
                label="Khuyến nghị dùng cho"
                rows={2}
                placeholder={l === 'vi' ? 'vd Vách ngăn nội thất, trần chống cháy' : 'e.g. Interior partitions, fire-rated ceilings'}
                value={v.translations[l]?.recommendedUse ?? ''}
                onChange={(s) => setTr(l, { recommendedUse: blankToNull(s) })}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-300 bg-slate-50/70 p-4">
        <Switch id={`variant-active-${i}`} label="Hiển thị trên web" hint={v.isActive ? 'Có trong bảng quy cách.' : 'Đang ẩn: không hiện, không tính EI cao nhất.'} checked={v.isActive} onChange={(isActive) => set({ isActive })} />
        <Switch id={`variant-popular-${i}`} label="Bán chạy" hint="Gắn nhãn “Phổ biến” trên trang." checked={v.isPopular} onChange={(isPopular) => set({ isPopular })} />
      </div>
    </div>
  );
}
