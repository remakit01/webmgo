// Kiểm tra link do CMS nhập (nút CTA, banner, link trong bài viết) — dùng chung cho DTO api và form CMS.
// Chỉ cho phép đường dẫn nội bộ "/..." hoặc http(s); chặn "javascript:", "data:", "//evil.com".

export const SAFE_LINK_PATTERN = /^(\/(?!\/)|https?:\/\/)\S*$/;

/** Như SAFE_LINK_PATTERN, thêm neo "#..." trong cùng trang */
export const SAFE_LINK_OR_ANCHOR_PATTERN = /^(\/(?!\/)|#|https?:\/\/)\S*$/;

export const isSafeLink = (link: string, options: { allowAnchor?: boolean } = {}): boolean =>
  (options.allowAnchor ? SAFE_LINK_OR_ANCHOR_PATTERN : SAFE_LINK_PATTERN).test(link);

/** Link nội bộ của site (bắt đầu bằng "/" nhưng không phải "//") */
export const isInternalLink = (link: string): boolean => /^\/(?!\/)/.test(link);
