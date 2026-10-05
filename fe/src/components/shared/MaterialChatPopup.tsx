'use client';

import React, { useState, useEffect } from 'react';
import MaterialChatInterface from './MaterialChatInterface';

interface MaterialChatPopupProps {
  defaultOpen?: boolean;
}

export default function MaterialChatPopup({ defaultOpen = false }: MaterialChatPopupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Lắng nghe sự kiện toàn cục để mở popup từ các nút khác trên trang
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-material-chat', handleOpenEvent);
    return () => window.removeEventListener('open-material-chat', handleOpenEvent);
  }, []);

  // Xử lý phím ESC để đóng popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* 1. NÚT KÍCH HOẠT FLOATING CHAT WIDGET GÓC DƯỚI BÊN PHẢI (KHÔNG DÙNG ICON) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Mở Trợ Lý Bóc Tách Dự Toán Vật Tư MGO"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-950 border-2 border-[#7CB305] text-white shadow-2xl hover:shadow-[#7CB305]/20 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-left pr-1">
              <div className="text-xs font-black text-white tracking-wide">
                Kỹ Sư Remak®
              </div>
              <div className="text-[10px] text-[#7CB305] font-semibold hidden sm:block">
                Bóc Tách Vật Tư 30s
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 2. CHAT POPUP WINDOW & MOBILE BACKDROP */}
      {isOpen && (
        <>
          {/* Lớp nền mờ chỉ hiện trên Mobile để tránh chạm nhầm và đè layout */}
          <div
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
          />

          {/* Khung chat modal popup: Bottom sheet trên mobile, widget góc phải trên desktop */}
          <div
            role="dialog"
            aria-label="Cửa sổ chat bóc tách dự toán vật tư"
            className="fixed inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:right-6 w-full md:w-[420px] h-[88vh] md:h-[630px] max-h-[88vh] md:max-h-[calc(100vh-48px)] z-50 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300"
          >
            {/* Nội dung Chat Interface - onClose được truyền trực tiếp vào header của interface */}
            <div className="h-full w-full flex flex-col min-h-0">
              <MaterialChatInterface
                isPopupMode={true}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

