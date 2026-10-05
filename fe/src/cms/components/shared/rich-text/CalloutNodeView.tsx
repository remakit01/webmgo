'use client';

import React from 'react';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { CALLOUT_VARIANTS, type CalloutVariant } from '@remak/shared/rich-content';

export const CALLOUT_STYLES: Record<CalloutVariant, { label: string; box: string }> = {
  info: { label: 'Thông tin kỹ thuật', box: 'border-sky-300 bg-sky-50' },
  warning: { label: 'Lưu ý quan trọng', box: 'border-amber-300 bg-amber-50' },
  tip: { label: 'Mẹo thi công', box: 'border-[#7CB305]/50 bg-[#F4F9E8]' },
};

/** Hộp lưu ý: chọn kiểu ngay trên khối, nội dung bên trong soạn như đoạn văn thường */
export default function CalloutNodeView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const variant = (node.attrs.variant as CalloutVariant) ?? 'info';
  const style = CALLOUT_STYLES[variant] ?? CALLOUT_STYLES.info;

  return (
    <NodeViewWrapper className={`my-5 rounded-lg border-l-4 px-4 py-3 ${style.box}`}>
      <div contentEditable={false} className="flex items-center gap-2 mb-1 select-none">
        <select
          value={variant}
          disabled={!editor.isEditable}
          onChange={(e) => updateAttributes({ variant: e.target.value })}
          aria-label="Kiểu hộp lưu ý"
          className="text-[11px] font-bold uppercase tracking-wide bg-transparent text-slate-700 focus:outline-none cursor-pointer"
        >
          {CALLOUT_VARIANTS.map((v) => (
            <option key={v} value={v}>
              {CALLOUT_STYLES[v].label}
            </option>
          ))}
        </select>
      </div>
      <NodeViewContent className="text-sm text-slate-800 [&_p]:my-1" />
    </NodeViewWrapper>
  );
}
