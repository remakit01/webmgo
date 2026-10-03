import React from 'react';

/**
 * Hiển thị văn bản từ CMS, chỉ hỗ trợ cú pháp **in đậm**.
 * Tách chuỗi thành text node React — không dùng dangerouslySetInnerHTML nên không có XSS.
 */
export default function InlineBold({ text, strongClassName }: { text: string; strongClassName?: string }) {
  // split với nhóm bắt: phần tử lẻ là nội dung nằm giữa ** **
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className={strongClassName}>
            {part}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
