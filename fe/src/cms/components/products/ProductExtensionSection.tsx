'use client';

import React from 'react';
import {
  type DecorativeSpecInput,
  type FloorSpecInput,
  type ProductInput,
  type SipSpecInput,
  type SpecOptionCms,
} from '@remak/shared/contracts/product';
import { BareInput, BareNumber, ChipsField, NumberField, RangeField, RepeatList, Section, SelectField, Switch, TagsField, TriStateField, labelClass } from './fields';
import { choiceLabel, choicesFor } from './spec-option-choices';

/** Thông số riêng theo loại sản phẩm: Panel SIP, Tấm sàn, Tấm trang trí. Loại khác không có phần này. */
export default function ProductExtensionSection({
  form,
  typeName,
  options,
  onChange,
  errors,
}: {
  form: Pick<ProductInput, 'sip' | 'floor' | 'decorative'>;
  /** Tên tiếng Việt của loại đang chọn */
  typeName: string;
  /** Danh mục thông số (CMS) — nguồn lựa chọn cho các ô */
  options: SpecOptionCms[];
  onChange: (patch: Partial<Pick<ProductInput, 'sip' | 'floor' | 'decorative'>>) => void;
  errors: Record<string, string>;
}) {
  return (
    <Section id="extension" title="Thông số riêng theo loại" description={`Loại hiện tại: ${typeName}. Đổi loại ở khung “Thiết lập” bên phải.`}>
      {form.sip ? (
        <SipFields sip={form.sip} options={options} onChange={(sip) => onChange({ sip })} errors={errors} />
      ) : form.floor ? (
        <FloorFields floor={form.floor} options={options} onChange={(floor) => onChange({ floor })} />
      ) : form.decorative ? (
        <DecorativeFields decorative={form.decorative} options={options} onChange={(decorative) => onChange({ decorative })} errors={errors} />
      ) : (
        <p className="text-sm text-slate-600">{typeName} không có thông số riêng — chỉ dùng thông số chung và độ dày ở trên.</p>
      )}
    </Section>
  );
}

function SipFields({ sip, options, onChange, errors }: { sip: SipSpecInput; options: SpecOptionCms[]; onChange: (s: SipSpecInput) => void; errors: Record<string, string> }) {
  const set = (patch: Partial<SipSpecInput>) => onChange({ ...sip, ...patch });
  return (
    <div className="space-y-4">
      <ChipsField label="Vật liệu lõi" options={choicesFor(options, 'SIP_CORE_MATERIAL', sip.coreMaterials)} value={sip.coreMaterials} onChange={(coreMaterials) => set({ coreMaterials })} />
      <div className="grid grid-cols-3 gap-4">
        <RangeField pathMin="sip.coreThicknessMinMm" pathMax="sip.coreThicknessMaxMm" label="Độ dày lõi" unit="mm" min={sip.coreThicknessMinMm} max={sip.coreThicknessMaxMm} onChange={(coreThicknessMinMm, coreThicknessMaxMm) => set({ coreThicknessMinMm, coreThicknessMaxMm })} errors={errors} />
        <NumberField path="sip.maxWidthMm" label="Rộng tối đa" unit="mm" integer value={sip.maxWidthMm} onChange={(maxWidthMm) => set({ maxWidthMm })} errors={errors} />
        <NumberField path="sip.maxLengthMm" label="Dài tối đa" unit="mm" integer value={sip.maxLengthMm} onChange={(maxLengthMm) => set({ maxLengthMm })} errors={errors} />
        <SelectField path="sip.loadBearing" label="Khả năng chịu lực" value={sip.loadBearing} options={choicesFor(options, 'LOAD_BEARING', sip.loadBearing)} onChange={(loadBearing) => set({ loadBearing })} errors={errors} />
      </div>
      <TagsField
        id="pf-sip-facingThicknessesMm"
        label="Độ dày tấm mặt MgO (mm)"
        placeholder="vd 10"
        value={sip.facingThicknessesMm.map(String)}
        onChange={(v) => set({ facingThicknessesMm: [...new Set(v.map((x) => Number(x.replace(',', '.'))).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b) })}
        hint="Gõ số rồi nhấn Enter, vd 10 và 12."
      />
    </div>
  );
}

function FloorFields({ floor, options, onChange }: { floor: FloorSpecInput; options: SpecOptionCms[]; onChange: (f: FloorSpecInput) => void }) {
  const set = (patch: Partial<FloorSpecInput>) => onChange({ ...floor, ...patch });
  return (
    <div className="space-y-4">
      <ChipsField label="Kiểu cạnh ghép" options={choicesFor(options, 'EDGE_PROFILE', floor.edgeProfiles)} value={floor.edgeProfiles} onChange={(edgeProfiles) => set({ edgeProfiles })} />
      <ChipsField label="Lớp phủ sàn phù hợp" options={choicesFor(options, 'SUITABLE_FLOORING', floor.suitableFloorings)} value={floor.suitableFloorings} onChange={(suitableFloorings) => set({ suitableFloorings })} />
      <RepeatList
        label="Khổ tấm sàn"
        itemName="khổ"
        items={floor.floorSizes}
        newItem={() => ({ widthMm: 1220, lengthMm: 2440 })}
        onChange={(floorSizes) => set({ floorSizes })}
        hint="Bỏ trống = dùng khổ tiêu chuẩn của dòng."
        renderItem={(s, setS, i) => (
          <div className="grid max-w-md grid-cols-2 gap-2">
            <BareNumber label={`Khổ sàn ${i + 1}: rộng`} unit="mm" value={s.widthMm} onChange={(w) => setS({ ...s, widthMm: w ?? 0 })} />
            <BareNumber label={`Khổ sàn ${i + 1}: dài`} unit="mm" value={s.lengthMm} onChange={(l) => setS({ ...s, lengthMm: l ?? 0 })} />
          </div>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <TriStateField label="Chống ẩm cho sàn" value={floor.moistureResistantFloor} onChange={(moistureResistantFloor) => set({ moistureResistantFloor })} />
        <TriStateField label="Bề mặt chà nhám" value={floor.sandedSurface} onChange={(sandedSurface) => set({ sandedSurface })} />
      </div>
    </div>
  );
}

function DecorativeFields({
  decorative,
  options,
  onChange,
  errors,
}: {
  decorative: DecorativeSpecInput;
  options: SpecOptionCms[];
  onChange: (d: DecorativeSpecInput) => void;
  errors: Record<string, string>;
}) {
  const used = new Set(decorative.options.map((o) => o.finishType));
  const finishChoices = choicesFor(options, 'DECORATIVE_FINISH', null);
  // Lớp mới: loại hoàn thiện đầu tiên chưa dùng (mỗi loại chỉ 1 lần)
  const nextType = finishChoices.find((c) => !used.has(c.value))?.value ?? null;
  return (
    <div className="space-y-4">
      <Switch id="decorative-custom-print" label="Nhận in theo thiết kế riêng" hint="Hiện lời mời gửi file thiết kế trên trang sản phẩm." checked={decorative.customPrintSupported} onChange={(customPrintSupported) => onChange({ ...decorative, customPrintSupported })} />
      {errors['decorative.options'] && <p className="text-xs font-semibold text-rose-700">{errors['decorative.options']}</p>}
      <RepeatList
        label="Lớp hoàn thiện"
        itemName="lớp hoàn thiện"
        items={decorative.options}
        max={nextType ? decorative.options.length + 1 : decorative.options.length}
        newItem={() => {
          const finishType = nextType ?? '';
          return { finishType, scratchResistance: null, translations: { vi: { name: choiceLabel(options, 'DECORATIVE_FINISH', finishType), description: null, patterns: [], suitableAreas: [] } } };
        }}
        onChange={(options) => onChange({ ...decorative, options })}
        renderItem={(o, setO, i) => {
          const vi = o.translations.vi ?? { name: '', description: null, patterns: [], suitableAreas: [] };
          const en = o.translations.en ?? { name: '', description: null, patterns: [], suitableAreas: [] };
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  path={`decorative.options.${i}.finishType`}
                  label="Loại hoàn thiện"
                  emptyLabel={null}
                  value={o.finishType}
                  options={choicesFor(options, 'DECORATIVE_FINISH', o.finishType)}
                  onChange={(t) => t && setO({ ...o, finishType: t })}
                  errors={errors}
                />
                <SelectField
                  path={`decorative.options.${i}.scratchResistance`}
                  label="Chống trầy"
                  value={o.scratchResistance}
                  options={choicesFor(options, 'SCRATCH_RESISTANCE', o.scratchResistance)}
                  onChange={(scratchResistance) => setO({ ...o, scratchResistance })}
                  errors={errors}
                />
              </div>
              {(['vi', 'en'] as const).map((l) => {
                const t = l === 'vi' ? vi : en;
                const setT = (patch: Partial<typeof t>) => {
                  const next = { ...t, ...patch };
                  // Bản tiếng Anh trống hoàn toàn -> không gửi
                  const empty = l === 'en' && !next.name.trim() && !next.description && !next.patterns.length && !next.suitableAreas.length;
                  const translations = { ...o.translations };
                  if (empty) delete translations.en;
                  else translations[l] = next;
                  setO({ ...o, translations });
                };
                return (
                  <div key={l} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                    <p className={labelClass}>{l === 'vi' ? 'Tiếng Việt' : 'English (tuỳ chọn)'}</p>
                    <BareInput label={`Tên hiển thị (${l})`} placeholder="Tên hiển thị" value={t.name} onChange={(name) => setT({ name })} />
                    <BareInput label={`Mô tả (${l})`} placeholder="Mô tả ngắn" rows={2} value={t.description ?? ''} onChange={(d) => setT({ description: d.trim() ? d : null })} />
                    <div className="grid grid-cols-2 gap-3">
                      <TagsField id={`pf-decor-${i}-${l}-patterns`} label="Mẫu vân / màu" placeholder="vd Vân gỗ sồi" value={t.patterns} onChange={(patterns) => setT({ patterns })} />
                      <TagsField id={`pf-decor-${i}-${l}-areas`} label="Khu vực phù hợp" placeholder="vd Sảnh khách sạn" value={t.suitableAreas} onChange={(suitableAreas) => setT({ suitableAreas })} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
