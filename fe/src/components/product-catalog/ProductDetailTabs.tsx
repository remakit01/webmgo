'use client';

import React, { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

export type ProductTabKey = 'info' | 'specs';

interface ProductDetailTabsProps {
  infoContent?: ReactNode;
  specsContent?: ReactNode;
  hasDescription: boolean;
  hasSpecs: boolean;
}

/**
 * Cụm 2 Tab trên cùng 1 hàng: "Thông số kỹ thuật" & "Thông tin sản phẩm"
 * Tuân thủ chuẩn W3C APG Tabs Pattern & Accessibility WCAG 2.2 AA.
 * Sử dụng Composition Pattern (nhận ReactNode từ Server Component) để hỗ trợ async Server Components như RichContent.
 */
export default function ProductDetailTabs({
  infoContent,
  specsContent,
  hasDescription,
  hasSpecs,
}: ProductDetailTabsProps) {
  const t = useTranslations('Products');

  // Ưu tiên mở tab Thông số kỹ thuật trước theo yêu cầu
  const defaultTab: ProductTabKey = hasSpecs ? 'specs' : 'info';
  const [activeTab, setActiveTab] = useState<ProductTabKey>(defaultTab);

  const tabListRef = useRef<HTMLDivElement>(null);
  const specsButtonRef = useRef<HTMLButtonElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  if (!hasDescription && !hasSpecs) {
    return null;
  }

  // Thứ tự tabs: 1. Thông số kỹ thuật -> 2. Thông tin sản phẩm
  const availableTabs: { key: ProductTabKey; label: string }[] = [];
  if (hasSpecs) {
    availableTabs.push({
      key: 'specs',
      label: t('specsTab'),
    });
  }
  if (hasDescription) {
    availableTabs.push({
      key: 'info',
      label: t('productInfoTab'),
    });
  }

  // Điều hướng phím mũi tên chuẩn W3C APG Tabs
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentKey: ProductTabKey) => {
    if (availableTabs.length <= 1) return;

    const currentIndex = availableTabs.findIndex((tab) => tab.key === currentKey);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % availableTabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = availableTabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextTab = availableTabs[nextIndex];
      setActiveTab(nextTab.key);
      if (nextTab.key === 'specs') {
        specsButtonRef.current?.focus();
      } else {
        infoButtonRef.current?.focus();
      }
    }
  };

  return (
    <section className="space-y-8" aria-label="Nội dung chi tiết">
      {/* ── THANH ĐIỀU HƯỚNG TABS (CĂN GIỮA CENTER) ── */}
      <div className="border-b border-slate-200">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Tùy chọn nội dung sản phẩm"
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-8"
        >
          {/* Tab 1: Thông số kỹ thuật (đặt trước) */}
          {hasSpecs && (
            <button
              ref={specsButtonRef}
              type="button"
              role="tab"
              id="tab-product-specs"
              aria-controls="panel-product-specs"
              aria-selected={activeTab === 'specs'}
              tabIndex={activeTab === 'specs' ? 0 : -1}
              onClick={() => setActiveTab('specs')}
              onKeyDown={(e) => handleKeyDown(e, 'specs')}
              className={`group relative inline-flex min-h-[46px] items-center px-4 py-3 text-base sm:text-lg font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-[#4E7202] ${
                activeTab === 'specs'
                  ? 'border-b-2 border-[#4E7202] text-[#3F5E02]'
                  : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t('specsTab')}</span>
            </button>
          )}

          {/* Tab 2: Thông tin sản phẩm (đặt sau) */}
          {hasDescription && (
            <button
              ref={infoButtonRef}
              type="button"
              role="tab"
              id="tab-product-info"
              aria-controls="panel-product-info"
              aria-selected={activeTab === 'info'}
              tabIndex={activeTab === 'info' ? 0 : -1}
              onClick={() => setActiveTab('info')}
              onKeyDown={(e) => handleKeyDown(e, 'info')}
              className={`group relative inline-flex min-h-[46px] items-center px-4 py-3 text-base sm:text-lg font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-[#4E7202] ${
                activeTab === 'info'
                  ? 'border-b-2 border-[#4E7202] text-[#3F5E02]'
                  : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t('productInfoTab')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── NỘI DUNG TAB 1: THÔNG SỐ KỸ THUẬT ── */}
      {hasSpecs && (
        <div
          role="tabpanel"
          id="panel-product-specs"
          aria-labelledby="tab-product-specs"
          hidden={activeTab !== 'specs'}
          className={`space-y-12 focus-visible:outline-none ${
            activeTab === 'specs' ? 'animate-tab-content' : ''
          }`}
        >
          {specsContent}
        </div>
      )}

      {/* ── NỘI DUNG TAB 2: THÔNG TIN SẢN PHẨM ── */}
      {hasDescription && (
        <div
          role="tabpanel"
          id="panel-product-info"
          aria-labelledby="tab-product-info"
          hidden={activeTab !== 'info'}
          className={`focus-visible:outline-none ${activeTab === 'info' ? 'animate-tab-content' : ''}`}
        >
          {infoContent}
        </div>
      )}
    </section>
  );
}
