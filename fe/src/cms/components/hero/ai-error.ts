// Thông báo lỗi dịch AI cho CMS (hàm thuần, không phụ thuộc React)

export interface AiErrorInfo {
  title: string;
  message: string;
  /** retry: lỗi tạm thời (thử lại có ích); copy: lỗi cấu hình (thử lại vô ích -> chép nguyên văn) */
  action: 'retry' | 'copy';
}

/** Thêm dấu chấm cuối câu nếu thiếu (câu báo lỗi từ API thường không có) */
const withPeriod = (text: string) => (/[.!?…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/** Phân loại lỗi dịch AI theo mã HTTP để chọn nội dung dialog và nút hành động phù hợp */
export function describeAiError(status: number, apiMessage: string): AiErrorInfo {
  if (status === 503) {
    return {
      title: 'Chưa bật được dịch tự động',
      message: `${withPeriod(apiMessage || 'Dịch tự động chưa được cấu hình')} Vui lòng báo quản trị kỹ thuật. Trong lúc chờ, bạn có thể chép nguyên văn tiếng Việt rồi tự dịch.`,
      action: 'copy',
    };
  }
  if (status === 429) {
    return {
      title: 'Dịch quá nhiều lần',
      message: 'Bạn đã dịch quá nhiều lần trong một phút. Vui lòng đợi khoảng 1 phút rồi thử lại.',
      action: 'retry',
    };
  }
  if (status === 0) {
    return {
      title: 'Mất kết nối',
      message: 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.',
      action: 'retry',
    };
  }
  return {
    title: 'Dịch vụ AI đang bận',
    message: apiMessage || 'Không dịch được lúc này, vui lòng thử lại.',
    action: 'retry',
  };
}
