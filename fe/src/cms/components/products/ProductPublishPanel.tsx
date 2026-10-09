'use client';

import React from 'react';
import { ExternalLink, Loader2, Undo2 } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import type {
  ProductCms,
  ProductInput,
  ProductPublishStatus,
} from '@remak/shared/contracts/product';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import { productPath } from '@/lib/product-paths';

export const LOCALE_LABEL: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'Tiếng Anh',
};

interface ProductPublishPanelProps {
  /** Tab ngôn ngữ đang mở ở editor */
  locale: Locale;
  /** Form data đang soạn */
  form: ProductInput;
  /** Dữ liệu CMS đã lưu trên server */
  cms: ProductCms | null;
  /** Trạng thái bận / đang lưu */
  busy: boolean;
  /** Hành động gỡ về nháp (set status DRAFT và lưu) */
  onUnpublish: () => void;
}

/**
 * Khung điều khiển & thông tin xuất bản cho NGÔN NGỮ đang mở:
 * - Tự động đồng bộ theo tab Tiếng Việt / Tiếng Anh
 * - Header: Nhãn ngôn ngữ + StatusBadge trực quan
 * - Link: "Xem trên website" khi bản dịch đã xuất bản
 * - Cảnh báo blockedReason nếu bản tiếng Anh chưa thể đăng (do bản tiếng Việt là nháp)
 * - Nút "Gỡ về nháp" khi đang ở trạng thái xuất bản
 * - Không trùng lặp nút Lưu / Xuất bản với Top Action Bar
 */
export default function ProductPublishPanel({
  locale,
  form,
  cms,
  busy,
  onUnpublish,
}: ProductPublishPanelProps) {
  const translation = form.translations[locale];
  const status: ProductPublishStatus | null = translation ? translation.status : null;
  const live = status === 'PUBLISHED';

  // Slug hiển thị cho link web
  const serverLive = cms?.published[locale];
  const slug = (serverLive?.status === 'PUBLISHED' && serverLive.slug) || translation?.slug;

  // Điều kiện nhắc nhở khi tiếng Anh được chọn mà tiếng Việt chưa live
  const viLive = form.translations.vi?.status === 'PUBLISHED';
  const blockedReason =
    locale === 'en' && !viLive
      ? 'Cần xuất bản bản tiếng Việt trước khi đăng bản tiếng Anh.'
      : null;

  return (
    <div className="space-y-3">
      {/* 1. Tiêu đề bản ngôn ngữ + Huy hiệu trạng thái */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">Bản {LOCALE_LABEL[locale]}</span>
        <StatusBadge status={status} />
      </div>

      {/* 2. Link Xem trên website khi đã xuất bản */}
      {status === 'PUBLISHED' && slug && (
        <div className="pt-0.5">
          <a
            href={productPath(locale, slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] hover:text-[#4E7202] hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            <ExternalLink size={12} aria-hidden="true" />
            <span>Xem trên website</span>
          </a>
        </div>
      )}

      {/* 3. Cảnh báo liên kết song ngữ */}
      {blockedReason && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          {blockedReason}
        </p>
      )}

      {/* 4. Nút Gỡ về nháp khi đang xuất bản */}
      {translation && live && (
        <div className="pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={onUnpublish}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Undo2 size={13} aria-hidden="true" />}
            <span>Gỡ về nháp</span>
          </button>
        </div>
      )}

      {/* 5. Ghi chú liên kết */}
      {locale === 'vi' && live && (
        <p className="text-[11px] text-slate-500">
          Gỡ bản tiếng Việt sẽ ẩn sản phẩm trên cả hai ngôn ngữ.
        </p>
      )}

      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        Trang web cập nhật tự động trong vòng 1 phút sau khi lưu.
      </p>
    </div>
  );
}
