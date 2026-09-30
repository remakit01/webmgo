/**
 * Utility functions for Remak MGO Website
 */

/**
 * Format số tiền sang định dạng VNĐ (ví dụ: 120.000 đ)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số thông thường (ví dụ: 1.500)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Helper nối class an toàn
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
