'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Trash2, 
  X, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmOptions {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  /** Nếu true, người dùng nhấn ra ngoài backdrop không tắt dialog */
  disableBackdropClick?: boolean;
  /** Thao tác bất đồng bộ thực hiện ngay trong dialog (tự động kích hoạt loading feedback) */
  onConfirm?: () => Promise<unknown> | unknown;
  /** Thông điệp Toast hiển thị sau khi hoàn thành thành công */
  successMessage?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showToast: (message: string, type?: ToastType) => void;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm phải được sử dụng bên trong <ConfirmDialogProvider>');
  }
  return context.confirm;
}

export function useToast() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong <ConfirmDialogProvider>');
  }
  return context.showToast;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  // State Dialog
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: {},
    resolve: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // State Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setActionError(null);
    setIsProcessing(false);
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    if (isProcessing) {
      // Báo hiệu phản hồi rung nếu người dùng cố đóng khi đang xử lý
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    setDialogState((prev) => {
      if (prev.resolve) prev.resolve(result);
      return { ...prev, isOpen: false, resolve: null };
    });
    setActionError(null);
  }, [isProcessing]);

  // Xử lý xác nhận với Feedback tiến trình
  const handleConfirmAction = async () => {
    const { options } = dialogState;
    if (options.onConfirm) {
      setIsProcessing(true);
      setActionError(null);
      try {
        await options.onConfirm();
        if (options.successMessage) {
          showToast(options.successMessage, 'success');
        }
        handleClose(true);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra trong quá trình xử lý';
        setActionError(errorMsg);
        showToast(errorMsg, 'error');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Trường hợp trả kết quả promise thông thường
      if (options.successMessage) {
        showToast(options.successMessage, 'success');
      }
      handleClose(true);
    }
  };

  // Lắng nghe phím ESC để hủy bỏ và focus vào nút xác nhận khi mở
  useEffect(() => {
    if (!dialogState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [dialogState.isOpen, isProcessing, handleClose]);

  const { options, isOpen } = dialogState;
  const variant = options.variant || 'danger';

  // Cấu hình màu sắc & biểu tượng theo Variant
  const variantConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-600/20',
      badge: 'Thao tác xóa vĩnh viễn',
      loadingText: 'Đang xóa dữ liệu...',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/20',
      badge: 'Cần xác nhận',
      loadingText: 'Đang xử lý...',
    },
    info: {
      icon: Info,
      iconBg: 'bg-[#5F8A03]/10 text-[#5F8A03] border border-[#5F8A03]/20',
      confirmBtn: 'bg-[#5F8A03] hover:bg-[#4E7202] text-white focus:ring-[#5F8A03] shadow-[#5F8A03]/20',
      badge: 'Xác nhận thông tin',
      loadingText: 'Đang lưu...',
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  return (
    <ConfirmContext.Provider value={{ confirm, showToast }}>
      {children}

      {/* DIALOG ROOT TOÀN CỤC VỚI PHẢN HỒI UX ĐẦY ĐỦ */}
      {isOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none admin-typography"
          onClick={(e) => {
            if (e.target === e.currentTarget && !options.disableBackdropClick) {
              handleClose(false);
            }
          }}
        >
          <div 
            className={`bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-300 p-6 space-y-5 animate-in zoom-in-95 duration-150 relative transition-transform ${
              isShaking ? 'translate-x-[-4px] ring-2 ring-rose-400' : ''
            }`}
          >
            {/* Nút X góc trên */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-30"
              title="Đóng (ESC)"
            >
              <X size={16} />
            </button>

            {/* Nội dung thông báo */}
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${variantConfig.iconBg}`}>
                {isProcessing ? (
                  <Loader2 size={22} className="animate-spin text-inherit" />
                ) : (
                  <IconComponent size={22} />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900 leading-snug">
                    {options.title || 'Bạn có chắc chắn muốn thực hiện?'}
                  </h3>
                </div>
                <div id="confirm-dialog-desc" className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {options.description || 'Thao tác này có thể không thể hoàn tác. Vui lòng xác nhận trước khi tiếp tục.'}
                </div>

                {/* Phản hồi lỗi trực tiếp trong Dialog nếu thao tác thất bại */}
                {actionError && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                    <AlertCircle size={15} className="shrink-0 text-rose-500" />
                    <span>{actionError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thanh nút bấm hành động kèm phản hồi Loading State */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40"
              >
                {options.cancelText || 'Hủy bỏ'}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer flex items-center gap-1.5 disabled:opacity-70 ${variantConfig.confirmBtn}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{variantConfig.loadingText}</span>
                  </>
                ) : (
                  <span>{options.confirmText || 'Xác nhận xóa'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HỆ THỐNG TOAST FEEDBACK TOÀN CỤC CHUẨN UI/UX PRO MAX */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[110] flex flex-col gap-2 max-w-sm w-full pointer-events-none admin-typography select-none">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <div
                key={toast.id}
                role="status"
                aria-live="polite"
                className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 transition-all ${
                  isSuccess
                    ? 'bg-slate-900/95 text-white border-slate-700/80 shadow-slate-900/30'
                    : isError
                    ? 'bg-rose-900/95 text-white border-rose-700/80 shadow-rose-900/30'
                    : isWarning
                    ? 'bg-amber-900/95 text-white border-amber-700/80 shadow-amber-900/30'
                    : 'bg-slate-900/95 text-white border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isSuccess && <CheckCircle2 size={18} className="text-[#7CB305] shrink-0" />}
                  {isError && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
                  {isWarning && <AlertTriangle size={18} className="text-amber-400 shrink-0" />}
                  {!isSuccess && !isError && !isWarning && <Info size={18} className="text-sky-400 shrink-0" />}
                  <span className="text-xs sm:text-sm font-semibold truncate">{toast.message}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                  title="Đóng thông báo"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
