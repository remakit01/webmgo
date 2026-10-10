'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, ChevronUp } from 'lucide-react';
import Link from '@/components/ui/LocaleLink';
import { useProductCompare } from '@/hooks/use-product-compare';
import { formatNum, formatVnd } from '@/components/product-catalog/format';
import {
  formatFireRating,
  formatRange,
  optionLabel,
  type SpecOptionGroup,
  type ProductDetailPublic,
  type ProductListItemPublic,
} from '@remak/shared/contracts/product';
import type { Locale } from '@/i18n/routing';
import { toLocalePath } from '@/i18n/paths';

interface ComparisonClientViewProps {
  initialProducts: ProductDetailPublic[];
  allCandidateProducts: ProductListItemPublic[];
  locale?: Locale;
}

export default function ComparisonClientView({
  initialProducts,
  locale = 'vi',
}: ComparisonClientViewProps) {
  const router = useRouter();
  const { removeFromCompare, setIsSearchModalOpen, totalSlots } = useProductCompare();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Danh sách sản phẩm hiển thị trên bảng so sánh (tối đa 3)
  const products = initialProducts.slice(0, 3);
  const emptySlotsCount = Math.max(0, totalSlots - products.length);

  // Toggle đóng / mở nhóm thông số
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Xóa 1 sản phẩm khỏi bảng so sánh và cập nhật lại URL
  const handleRemove = (slug: string, id: string) => {
    removeFromCompare(id);
    const remainingSlugs = products.filter((p) => p.slug !== slug).map((p) => p.slug);
    if (remainingSlugs.length > 0) {
      router.push(toLocalePath(`/so-sanh?items=${encodeURIComponent(remainingSlugs.join(','))}`, locale));
    } else {
      router.push(toLocalePath('/san-pham', locale));
    }
  };

  // Các helper chuẩn định dạng từ spec data thực tế của từng sản phẩm
  const yesNo = (v: boolean | null | undefined) =>
    v === null || v === undefined ? null : v ? (locale === 'en' ? 'Có (Yes)' : 'Có') : locale === 'en' ? 'Không (No)' : 'Không';
  const opt = (p: ProductDetailPublic, group: SpecOptionGroup, code: string | null | undefined) =>
    code ? optionLabel(p.optionLabels, group, code) : null;
  const n = (v: number | null | undefined, unit: string, digits?: number) =>
    v === null || v === undefined ? null : `${formatNum(v, locale, digits)} ${unit}`;
  const list = (v: readonly string[] | undefined | null) => (v && v.length ? v.join(', ') : null);
  const size = (w: number, l: number) => `${formatNum(w, locale)} × ${formatNum(l, locale)} mm`;

  // 6 nhóm tiêu chí kỹ thuật chuẩn Remak MGO lấy 100% từ database/CMS
  const specGroups = useMemo(() => {
    return [
      {
        id: 'thermalFire',
        title: 'NHIỆT & CHỐNG CHÁY',
        rows: [
          {
            label: 'Cấp phản ứng với lửa',
            getValue: (p: ProductDetailPublic) => p.spec?.thermalFire?.reactionToFireClass ?? null,
          },
          {
            label: 'Giới hạn chịu lửa',
            getValue: (p: ProductDetailPublic) => {
              const eiMin = p.variants?.reduce<number | null>(
                (m, v) => (v.fireRatingMinMinutes == null ? m : m == null ? v.fireRatingMinMinutes : Math.min(m, v.fireRatingMinMinutes)),
                null
              );
              return formatFireRating(eiMin, p.spec?.thermalFire?.maxFireRatingMinutes ?? null);
            },
          },
          {
            label: 'Tiêu chuẩn phân loại cháy',
            getValue: (p: ProductDetailPublic) => list(p.spec?.thermalFire?.fireClassStandards),
          },
          {
            label: 'Chịu nhiệt tối đa',
            getValue: (p: ProductDetailPublic) => n(p.spec?.thermalFire?.maxTemperatureC, '°C', 0),
          },
          {
            label: 'Hệ số dẫn nhiệt',
            getValue: (p: ProductDetailPublic) => n(p.spec?.thermalFire?.thermalConductivityWmk, 'W/(m·K)', 4),
          },
        ],
      },
      {
        id: 'acousticMoisture',
        title: 'CÁCH ÂM & CHỐNG ẨM',
        rows: [
          {
            label: 'Chống nấm mốc',
            getValue: (p: ProductDetailPublic) => yesNo(p.spec?.acousticMoisture?.moldResistant),
          },
          {
            label: 'Độ hút nước',
            getValue: (p: ProductDetailPublic) =>
              formatRange(null, p.spec?.acousticMoisture?.waterAbsorptionMaxPct ?? null, '%', locale, { strictMax: true }),
          },
          {
            label: 'Trương nở chiều dày',
            getValue: (p: ProductDetailPublic) =>
              formatRange(null, p.spec?.acousticMoisture?.thicknessSwellingMaxPct ?? null, '%', locale),
          },
          {
            label: 'Cách âm',
            getValue: (p: ProductDetailPublic) =>
              formatRange(p.spec?.acousticMoisture?.soundReductionMinDb ?? null, p.spec?.acousticMoisture?.soundReductionMaxDb ?? null, 'dB', locale),
          },
        ],
      },
      {
        id: 'physical',
        title: 'KÍCH THƯỚC & BỀ MẶT',
        rows: [
          {
            label: 'Khổ tiêu chuẩn',
            getValue: (p: ProductDetailPublic) =>
              list(p.spec?.physical?.standardSizes?.map((z) => size(z.widthMm, z.lengthMm))),
          },
          {
            label: 'Dải độ dày có sẵn',
            getValue: (p: ProductDetailPublic) => {
              const ths = Array.from(new Set(p.variants?.map((v) => v.thicknessMm) || [])).sort((a, b) => a - b);
              return ths.length > 0 ? `${ths.map((v) => formatNum(v, locale)).join(', ')} mm` : null;
            },
          },
          {
            label: 'Kiểu cạnh',
            getValue: (p: ProductDetailPublic) => opt(p, 'EDGE_PROFILE', p.spec?.physical?.edgeProfile),
          },
          {
            label: 'Bề mặt',
            getValue: (p: ProductDetailPublic) => opt(p, 'SURFACE_FINISH', p.spec?.physical?.surfaceFinish),
          },
          {
            label: 'Màu cốt tấm',
            getValue: (p: ProductDetailPublic) => opt(p, 'CORE_COLOR', p.spec?.physical?.coreColor),
          },
        ],
      },
      {
        id: 'mechanical',
        title: 'CƠ LÝ',
        rows: [
          {
            label: 'Khả năng bám vít',
            getValue: (p: ProductDetailPublic) => opt(p, 'SCREW_HOLDING', p.spec?.mechanical?.screwHoldingRating),
          },
          {
            label: 'Cường độ uốn (dọc)',
            getValue: (p: ProductDetailPublic) =>
              formatRange(p.spec?.mechanical?.flexuralMinMpa ?? null, p.spec?.mechanical?.flexuralMaxMpa ?? null, 'MPa', locale),
          },
          {
            label: 'Cường độ uốn (ngang)',
            getValue: (p: ProductDetailPublic) =>
              formatRange(p.spec?.mechanical?.flexuralCrossMinMpa ?? null, null, 'MPa', locale),
          },
          {
            label: 'Tỷ trọng',
            getValue: (p: ProductDetailPublic) =>
              formatRange(p.spec?.mechanical?.densityMinKgM3 ?? null, p.spec?.mechanical?.densityMaxKgM3 ?? null, 'kg/m³', locale),
          },
          {
            label: 'Nhẹ hơn tấm tiêu chuẩn',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.mechanical?.densityReductionPct != null
                ? `nhẹ hơn ${formatNum(p.spec.mechanical.densityReductionPct, locale)}%`
                : null,
          },
        ],
      },
      {
        id: 'chemistrySafety',
        title: 'HOÁ HỌC & AN TOÀN',
        rows: [
          {
            label: 'Không chứa amiăng',
            getValue: (p: ProductDetailPublic) => yesNo(p.spec?.chemistrySafety?.asbestosFree),
          },
          {
            label: 'Formaldehyde',
            getValue: (p: ProductDetailPublic) => n(p.spec?.chemistrySafety?.formaldehydeMgL, 'mg/L'),
          },
          {
            label: 'Mức VOC',
            getValue: (p: ProductDetailPublic) => opt(p, 'VOC_LEVEL', p.spec?.chemistrySafety?.vocLevel),
          },
          {
            label: 'Hàm lượng MgO',
            getValue: (p: ProductDetailPublic) =>
              formatRange(p.spec?.chemistrySafety?.mgoContentMinPct ?? null, null, '%', locale),
          },
          {
            label: 'Pha tinh thể',
            getValue: (p: ProductDetailPublic) => opt(p, 'CRYSTAL_PHASE', p.spec?.chemistrySafety?.crystalPhase),
          },
          {
            label: 'Clorua tự do',
            getValue: (p: ProductDetailPublic) =>
              formatRange(null, p.spec?.chemistrySafety?.chlorideMaxPct ?? null, '%', locale),
          },
          {
            label: 'Chứng nhận công trình xanh',
            getValue: (p: ProductDetailPublic) => list(p.spec?.chemistrySafety?.greenCertifications),
          },
        ],
      },
      {
        id: 'extension',
        title: 'THÔNG SỐ RIÊNG',
        rows: [
          {
            label: 'Vật liệu lõi',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'SIP'
                ? list(p.spec.extension.coreMaterials?.map((m) => optionLabel(p.optionLabels, 'SIP_CORE_MATERIAL', m)))
                : null,
          },
          {
            label: 'Độ dày lõi',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'SIP'
                ? formatRange(p.spec.extension.coreThicknessMinMm, p.spec.extension.coreThicknessMaxMm, 'mm', locale)
                : null,
          },
          {
            label: 'Độ dày tấm mặt MgO',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'SIP' && p.spec.extension.facingThicknessesMm?.length
                ? `${p.spec.extension.facingThicknessesMm.map((v) => formatNum(v, locale)).join(', ')} mm`
                : null,
          },
          {
            label: 'Kích thước tối đa',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'SIP' && p.spec.extension.maxWidthMm && p.spec.extension.maxLengthMm
                ? size(p.spec.extension.maxWidthMm, p.spec.extension.maxLengthMm)
                : null,
          },
          {
            label: 'Khả năng chịu lực',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'SIP' ? opt(p, 'LOAD_BEARING', p.spec.extension.loadBearing) : null,
          },
          {
            label: 'Kiểu cạnh ghép sàn',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'FLOOR'
                ? list(p.spec.extension.edgeProfiles?.map((e) => optionLabel(p.optionLabels, 'EDGE_PROFILE', e)))
                : null,
          },
          {
            label: 'Lớp phủ sàn phù hợp',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'FLOOR'
                ? list(p.spec.extension.suitableFloorings?.map((f) => optionLabel(p.optionLabels, 'SUITABLE_FLOORING', f)))
                : null,
          },
          {
            label: 'Khổ tấm sàn',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'FLOOR'
                ? list(p.spec.extension.floorSizes?.map((z) => size(z.widthMm, z.lengthMm)))
                : null,
          },
          {
            label: 'Chống ẩm cho sàn',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'FLOOR' ? yesNo(p.spec.extension.moistureResistantFloor) : null,
          },
          {
            label: 'Bề mặt chà nhám',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'FLOOR' ? yesNo(p.spec.extension.sandedSurface) : null,
          },
          {
            label: 'In theo thiết kế riêng',
            getValue: (p: ProductDetailPublic) =>
              p.spec?.extension?.type === 'DECORATIVE' ? yesNo(p.spec.extension.customPrintSupported) : null,
          },
        ],
      },
    ];
  }, [locale]);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa có sản phẩm nào để so sánh</h2>
        <p className="text-sm text-slate-500 mb-6">
          Vui lòng chọn ít nhất 2 sản phẩm tấm chống cháy Remak® MGO để xem bảng đối chiếu chi tiết.
        </p>
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F26522] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#F26522]/20 hover:bg-[#D95314] cursor-pointer"
        >
          <Plus size={18} />
          <span>Chọn sản phẩm ngay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thanh công cụ thao tác */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="sr-only">So Sánh Sản Phẩm Tấm Chống Cháy Remak® MGO</h1>

        {/* Nút Toggle: "Chỉ xem điểm khác biệt" */}
        <label className="ml-auto inline-flex items-center gap-2.5 cursor-pointer select-none bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:border-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={onlyDifferences}
            onChange={(e) => setOnlyDifferences(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-10 h-5.5 rounded-full transition-colors relative ${
              onlyDifferences ? 'bg-[#F26522]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                onlyDifferences ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            Chỉ xem điểm khác biệt
          </span>
        </label>
      </div>

      {/* Bảng so sánh đa cột phong cách Thế Giới Di Động */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* HÀNG CỐ ĐỊNH (STICKY HEADER): Danh sách sản phẩm đối chiếu */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
          <div className="grid grid-cols-12 divide-x divide-slate-200 items-start">
            {/* Cột 1: Nhãn tiêu chí */}
            <div className="col-span-3 sm:col-span-3 p-3 sm:p-5 self-stretch flex items-center justify-start">
              <span className="text-xs sm:text-sm lg:text-base font-medium text-slate-500">
                So sánh sản phẩm
              </span>
            </div>

            {/* Các Cột Sản Phẩm (Mỗi sản phẩm 1 cột chuẩn TGDD) */}
            <div className="col-span-9 sm:col-span-9 grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-200">
              {products.map((p) => {
                const minPrice = p.priceRange?.low ?? p.variants?.[0]?.priceVnd;
                return (
                  <div key={p.id} className="p-3 sm:p-5 flex flex-col items-start text-left relative group">
                    {/* Nút xóa sản phẩm: Vòng tròn viền xám mỏng góc trên phải */}
                    {products.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemove(p.slug, p.id)}
                        aria-label={`Xóa ${p.name}`}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer z-10"
                        title="Bỏ sản phẩm này"
                      >
                        <X size={13} />
                      </button>
                    )}

                    {/* Ảnh sản phẩm lớn, căn giữa cột */}
                    <div className="h-32 sm:h-44 w-full flex items-center justify-center mb-2 px-2">
                      <img
                        src={p.coverImageUrl || '/Logo_remak_800.png'}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Tên sản phẩm in đậm 2 dòng, căn lề trái (start) */}
                    <h3 className="w-full text-left text-xs sm:text-sm lg:text-base font-bold text-slate-900 line-clamp-2 min-h-[36px] sm:min-h-[44px] leading-snug">
                      <Link href={`/san-pham/${p.slug}`} className="hover:text-[#F26522] transition-colors">
                        {p.name}
                      </Link>
                    </h3>

                    {/* Giá bán nổi bật màu đỏ, căn lề trái (start) chuẩn TGDD */}
                    {minPrice ? (
                      <div className="mt-1 flex flex-wrap items-baseline justify-start gap-1.5 w-full text-left">
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-[#d70018]">
                          {formatVnd(minPrice, locale)}
                        </span>
                        {p.priceRange?.high && p.priceRange.high > minPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatVnd(p.priceRange.high, locale)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 w-full text-left">
                        <span className="text-xs sm:text-sm font-bold text-[#d70018]">Liên hệ báo giá</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Slot trống: Nút thêm sản phẩm */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div
                  key={`add-col-${idx}`}
                  className="p-3 sm:p-5 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200/90 m-2 sm:m-3 rounded-xl bg-slate-50/60 hover:border-[#F26522] hover:bg-orange-50/20 transition-all cursor-pointer group min-h-[160px]"
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-orange-50 text-[#F26522] group-hover:bg-[#F26522] group-hover:text-white transition-all mb-2 shadow-xs">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#F26522] transition-colors">
                    Thêm sản phẩm
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Chọn tối đa 3 sản phẩm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* THÂN BẢNG: 6 Nhóm thông số kỹ thuật chuẩn Remak MGO (Accordion chuẩn TGDD) */}
        <div className="divide-y divide-slate-200">
          {specGroups.map((group) => {
            // Lọc ra các hàng có ít nhất 1 sản phẩm có dữ liệu
            const rowsWithData = group.rows.filter((r) => products.some((p) => r.getValue(p) !== null));

            // Nếu bật "Chỉ xem điểm khác biệt", lọc các hàng mà giá trị giữa các sản phẩm khác nhau
            const visibleRows = onlyDifferences
              ? rowsWithData.filter((r) => {
                  const values = products.map((p) => r.getValue(p));
                  return new Set(values).size > 1;
                })
              : rowsWithData;

            // Nếu nhóm không có tiêu chí nào có số liệu, ẩn toàn bộ nhóm
            if (visibleRows.length === 0) return null;

            const isCollapsed = Boolean(collapsedGroups[group.id]);

            return (
              <div key={group.id} className="border-b border-slate-200 last:border-b-0">
                {/* Header nhóm (Accordion có nút chevron tròn) */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full bg-[#f8f9fa] hover:bg-slate-100/80 px-3 sm:px-6 py-3 border-y border-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer text-left select-none"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-2xs shrink-0">
                    <ChevronUp
                      size={12}
                      className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                    {group.title}
                  </span>
                </button>

                {/* Các dòng tiêu chí (Hiển thị khi không collapsed) */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-200">
                    {visibleRows.map((row, rIdx) => {
                      const values = products.map((p) => row.getValue(p));
                      const isDiff = new Set(values).size > 1;

                      return (
                        <div
                          key={rIdx}
                          className={`grid grid-cols-12 divide-x divide-slate-200 text-xs sm:text-sm items-center hover:bg-slate-50/50 transition-colors ${
                            isDiff ? 'bg-amber-50/25' : ''
                          }`}
                        >
                          {/* Cột 1: Tên tiêu chí (Chữ xám căn trái) */}
                          <div className="col-span-3 sm:col-span-3 p-3 sm:p-4 pl-3 sm:pl-6 font-normal text-slate-500 flex items-center gap-1.5">
                            <span>{row.label}</span>
                            {isDiff && (
                              <span
                                className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"
                                title="Khác biệt"
                              />
                            )}
                          </div>

                          {/* Cột 2, 3, 4: Giá trị từng sản phẩm (Có dấu bullet tròn • chuẩn TGDD) */}
                          <div className="col-span-9 sm:col-span-9 grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-200">
                            {products.map((p) => {
                              const val = row.getValue(p);
                              return (
                                <div
                                  key={p.id}
                                  className="p-3 sm:p-4 pl-3 sm:pl-6 flex items-start gap-2 text-left"
                                >
                                  {val ? (
                                    <>
                                      <span className="text-slate-400 select-none font-bold text-xs leading-5 shrink-0">
                                        •
                                      </span>
                                      <div className="text-slate-800 font-normal leading-5">{val}</div>
                                    </>
                                  ) : (
                                    <span className="text-slate-300 font-normal leading-5">—</span>
                                  )}
                                </div>
                              );
                            })}

                            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                              <div
                                key={`empty-cell-${idx}`}
                                className="flex items-center justify-center p-3 sm:p-4 text-center text-slate-300"
                              >
                                —
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
