'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CompareProductItem {
  id: string;
  slug: string;
  name: string;
  coverImageUrl?: string | null;
  priceVnd?: number | null;
  compareAtPriceVnd?: number | null;
  discountPercent?: number | null;
  typeName?: string;
  thicknessesMm?: number[];
  fireRatingLabel?: string | null;
  summary?: string | null;
}

interface CompareContextValue {
  compareItems: CompareProductItem[];
  addToCompare: (product: CompareProductItem) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isDockCollapsed: boolean;
  setIsDockCollapsed: (collapsed: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  totalSlots: number;
}

const STORAGE_KEY = 'remak_mgo_compare_items';
const MAX_COMPARE_SLOTS = 3;

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProductItem[]>([]);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Khôi phục từ localStorage sau khi mounted trên client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompareItems(parsed.slice(0, MAX_COMPARE_SLOTS));
        }
      }
    } catch {
      // bỏ qua lỗi parse
    }
    setMounted(true);
  }, []);

  // Lưu vào localStorage mỗi khi compareItems thay đổi
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    } catch {
      // bỏ qua lỗi storage
    }
  }, [compareItems, mounted]);

  const addToCompare = useCallback((product: CompareProductItem) => {
    let success = false;
    setCompareItems((prev) => {
      // Nếu đã có trong danh sách thì không thêm lại
      if (prev.some((item) => item.id === product.id || item.slug === product.slug)) {
        return prev;
      }
      // Giới hạn tối đa 3 sản phẩm
      if (prev.length >= MAX_COMPARE_SLOTS) {
        return prev;
      }
      success = true;
      return [...prev, product];
    });
    // Tự động mở rộng dock nếu đang thu gọn
    setIsDockCollapsed(false);
    return success;
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId && item.slug !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
    setIsDockCollapsed(false);
  }, []);

  const isInCompare = useCallback(
    (productId: string) => {
      return compareItems.some((item) => item.id === productId || item.slug === productId);
    },
    [compareItems]
  );

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isDockCollapsed,
        setIsDockCollapsed,
        isSearchModalOpen,
        setIsSearchModalOpen,
        totalSlots: MAX_COMPARE_SLOTS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useProductCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useProductCompare must be used within a CompareProvider');
  }
  return context;
}
