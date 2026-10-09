'use client';

import React, { type ReactNode } from 'react';
import {
  maxFireRatingMinutes,
  type ProductVariantInput,
  type SpecOptionCms,
  type TechnicalSpecInput,
} from '@remak/shared/contracts/product';
import { BareInput, BareNumber, NumberField, RangeField, RepeatList, Section, SelectField, TagsField, TextField, TriStateField } from './fields';
import { blankToNull, fieldId } from './product-form';
import { choicesFor } from './spec-option-choices';

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 pt-7 first:pt-0">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex flex-col items-center bg-white px-4 text-center">
          <span className="inline-block rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-2xs select-none">
            {title}
          </span>
          {description && (
            <p className="mt-1.5 text-xs font-normal text-slate-600 max-w-xl leading-normal">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 items-start gap-x-4 gap-y-3.5">{children}</div>
    </div>
  );
}

/**
 * Thông số kỹ thuật chung của dòng tấm (TDS), chia 5 nhóm như catalog.
 * Ô trống = chưa có số liệu -> web ẩn dòng đó (không tự điền số mặc định).
 */
export default function ProductSpecSection({
  spec,
  variants,
  options,
  onChange,
  errors,
}: {
  spec: TechnicalSpecInput;
  variants: ProductVariantInput[];
  /** Danh mục thông số (CMS) — nguồn lựa chọn cho các ô chọn */
  options: SpecOptionCms[];
  onChange: (patch: Partial<TechnicalSpecInput>) => void;
  errors: Record<string, string>;
}) {
  const p = (f: keyof TechnicalSpecInput) => `technicalSpec.${f}`;
  const maxEi = maxFireRatingMinutes(variants);

  return (
    <Section id="spec" title="Thông số kỹ thuật" description="Thông số chung của cả dòng tấm. Ô để trống = chưa có số liệu, trang web sẽ không hiện dòng đó.">
      <Group title="Kích thước & bề mặt">
        <div className="col-span-3">
          <RepeatList
            label="Khổ tiêu chuẩn"
            itemName="khổ"
            items={spec.standardSizes}
            newItem={() => ({ widthMm: 1220, lengthMm: 2440 })}
            onChange={(standardSizes) => onChange({ standardSizes })}
            renderItem={(s, setS, i) => (
              <div className="grid max-w-md grid-cols-2 gap-2.5">
                <BareNumber label={`Khổ ${i + 1}: rộng`} unit="mm" value={s.widthMm} onChange={(w) => setS({ ...s, widthMm: w ?? 0 })} />
                <BareNumber label={`Khổ ${i + 1}: dài`} unit="mm" value={s.lengthMm} onChange={(l) => setS({ ...s, lengthMm: l ?? 0 })} />
              </div>
            )}
          />
        </div>
        <SelectField path={p('edgeProfile')} label="Kiểu cạnh" value={spec.edgeProfile} options={choicesFor(options, 'EDGE_PROFILE', spec.edgeProfile)} onChange={(edgeProfile) => onChange({ edgeProfile })} errors={errors} />
        <SelectField path={p('coreColor')} label="Màu cốt tấm" value={spec.coreColor} options={choicesFor(options, 'CORE_COLOR', spec.coreColor)} onChange={(coreColor) => onChange({ coreColor })} errors={errors} />
        <SelectField path={p('surfaceFinish')} label="Bề mặt" value={spec.surfaceFinish} options={choicesFor(options, 'SURFACE_FINISH', spec.surfaceFinish)} onChange={(surfaceFinish) => onChange({ surfaceFinish })} errors={errors} />
      </Group>

      <Group title="Cơ lý">
        <RangeField pathMin={p('densityMinKgM3')} pathMax={p('densityMaxKgM3')} label="Tỷ trọng" unit="kg/m³" min={spec.densityMinKgM3} max={spec.densityMaxKgM3} onChange={(densityMinKgM3, densityMaxKgM3) => onChange({ densityMinKgM3, densityMaxKgM3 })} errors={errors} />
        <RangeField
          pathMin={p('flexuralMinMpa')}
          pathMax={p('flexuralMaxMpa')}
          label="Cường độ uốn (dọc)"
          unit="MPa"
          hint="“≥ 25” thì chỉ nhập ô Từ."
          min={spec.flexuralMinMpa}
          max={spec.flexuralMaxMpa}
          onChange={(flexuralMinMpa, flexuralMaxMpa) => onChange({ flexuralMinMpa, flexuralMaxMpa })}
          errors={errors}
        />
        <NumberField path={p('flexuralCrossMinMpa')} label="Cường độ uốn (ngang) ≥" unit="MPa" value={spec.flexuralCrossMinMpa} onChange={(flexuralCrossMinMpa) => onChange({ flexuralCrossMinMpa })} errors={errors} />
        <NumberField path={p('densityReductionPct')} label="Nhẹ hơn tấm tiêu chuẩn" unit="%" hint="Chỉ dùng cho dòng nhẹ (LiteCore™)." value={spec.densityReductionPct} onChange={(densityReductionPct) => onChange({ densityReductionPct })} errors={errors} />
        <SelectField path={p('screwHoldingRating')} label="Khả năng bám vít" value={spec.screwHoldingRating} options={choicesFor(options, 'SCREW_HOLDING', spec.screwHoldingRating)} onChange={(screwHoldingRating) => onChange({ screwHoldingRating })} errors={errors} />
      </Group>

      <Group title="Nhiệt & chống cháy" description={`Giới hạn chịu lửa EI lấy từ từng độ dày${maxEi ? ` — hiện cao nhất EI ${maxEi}` : ' — chưa có độ dày nào nhập EI'}.`}>
        <TextField path={p('reactionToFireClass')} label="Cấp phản ứng với lửa" placeholder="vd A1" value={spec.reactionToFireClass ?? ''} onChange={(v) => onChange({ reactionToFireClass: blankToNull(v) })} errors={errors} />
        <NumberField path={p('maxTemperatureC')} label="Chịu nhiệt tối đa" unit="°C" value={spec.maxTemperatureC} onChange={(maxTemperatureC) => onChange({ maxTemperatureC })} errors={errors} />
        <NumberField path={p('thermalConductivityWmk')} label="Hệ số dẫn nhiệt" unit="W/(m·K)" value={spec.thermalConductivityWmk} onChange={(thermalConductivityWmk) => onChange({ thermalConductivityWmk })} errors={errors} />
        <div className="col-span-3">
          <TagsField id={fieldId(p('fireClassStandards'))} label="Tiêu chuẩn phân loại cháy" placeholder="vd ASTM E84" value={spec.fireClassStandards} onChange={(fireClassStandards) => onChange({ fireClassStandards })} />
        </div>
      </Group>

      <Group title="Cách âm & chống ẩm">
        <RangeField pathMin={p('soundReductionMinDb')} pathMax={p('soundReductionMaxDb')} label="Cách âm" unit="dB" min={spec.soundReductionMinDb} max={spec.soundReductionMaxDb} onChange={(soundReductionMinDb, soundReductionMaxDb) => onChange({ soundReductionMinDb, soundReductionMaxDb })} errors={errors} />
        <NumberField path={p('waterAbsorptionMaxPct')} label="Hút nước <" unit="%" value={spec.waterAbsorptionMaxPct} onChange={(waterAbsorptionMaxPct) => onChange({ waterAbsorptionMaxPct })} errors={errors} />
        <NumberField path={p('thicknessSwellingMaxPct')} label="Trương nở chiều dày ≤" unit="%" value={spec.thicknessSwellingMaxPct} onChange={(thicknessSwellingMaxPct) => onChange({ thicknessSwellingMaxPct })} errors={errors} />
        <TriStateField label="Chống nấm mốc" value={spec.moldResistant} onChange={(moldResistant) => onChange({ moldResistant })} />
      </Group>

      <Group title="Hoá học & an toàn">
        <SelectField path={p('crystalPhase')} label="Pha tinh thể" value={spec.crystalPhase} options={choicesFor(options, 'CRYSTAL_PHASE', spec.crystalPhase)} onChange={(crystalPhase) => onChange({ crystalPhase })} errors={errors} />
        <NumberField path={p('mgoContentMinPct')} label="Hàm lượng MgO ≥" unit="%" value={spec.mgoContentMinPct} onChange={(mgoContentMinPct) => onChange({ mgoContentMinPct })} errors={errors} />
        <NumberField path={p('chlorideMaxPct')} label="Clorua tự do ≤" unit="%" hint="≤ 0,02% thì web ghi “không gỉ khung thép”." value={spec.chlorideMaxPct} onChange={(chlorideMaxPct) => onChange({ chlorideMaxPct })} errors={errors} />
        <NumberField path={p('formaldehydeMgL')} label="Formaldehyde" unit="mg/L" value={spec.formaldehydeMgL} onChange={(formaldehydeMgL) => onChange({ formaldehydeMgL })} errors={errors} />
        <SelectField path={p('vocLevel')} label="Mức VOC" value={spec.vocLevel} options={choicesFor(options, 'VOC_LEVEL', spec.vocLevel)} onChange={(vocLevel) => onChange({ vocLevel })} errors={errors} />
        <TriStateField label="Không chứa amiăng" value={spec.asbestosFree} onChange={(asbestosFree) => onChange({ asbestosFree })} />
        <div className="col-span-3">
          <TagsField id={fieldId(p('greenCertifications'))} label="Chứng nhận công trình xanh" placeholder="vd LEED" value={spec.greenCertifications} onChange={(greenCertifications) => onChange({ greenCertifications })} />
        </div>
      </Group>

      <Group title="Chỉ tiêu khác" description="Chỉ tiêu chưa có ô riêng ở trên (vd độ cứng bề mặt). Hiện thêm vào bảng thông số.">
        <div className="col-span-3">
          <RepeatList
            label="Chỉ tiêu"
            itemName="chỉ tiêu"
            items={spec.extraSpecs}
            newItem={() => ({ key: '', value: '', unit: '' })}
            onChange={(extraSpecs) => onChange({ extraSpecs })}
            renderItem={(s, setS, i) => (
              <div className="grid grid-cols-[2fr_2fr_1fr] gap-2.5">
                <BareInput label={`Chỉ tiêu ${i + 1}: tên`} placeholder="Tên chỉ tiêu" value={s.key} onChange={(key) => setS({ ...s, key })} />
                <BareInput label={`Chỉ tiêu ${i + 1}: giá trị`} placeholder="Giá trị" value={s.value} onChange={(value) => setS({ ...s, value })} />
                <BareInput label={`Chỉ tiêu ${i + 1}: đơn vị`} placeholder="Đơn vị" value={s.unit ?? ''} onChange={(unit) => setS({ ...s, unit })} />
              </div>
            )}
          />
        </div>
      </Group>
    </Section>
  );
}
