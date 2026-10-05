import React from 'react';

/**
 * Dữ liệu có cấu trúc schema.org (JSON-LD). Escape "<" để chuỗi nội dung không thể đóng thẻ <script> (chống XSS).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
