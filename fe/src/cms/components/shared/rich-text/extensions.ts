// Cấu hình TipTap khớp đúng whitelist của @remak/shared/rich-content (API từ chối khối/thuộc tính nằm ngoài).
// Thêm khối mới: thêm ở shared (RICH_NODE_TYPES + NODE_ATTRS) trước, rồi thêm extension ở đây và renderer ở fe public.

import { mergeAttributes, Node, ReactNodeViewRenderer, type AnyExtension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';
import { HEADING_LEVELS, type CalloutVariant } from '@remak/shared/rich-content';
import ImageNodeView from './ImageNodeView';
import CalloutNodeView from './CalloutNodeView';
import RelatedPostNodeView from './RelatedPostNodeView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: { insertCallout: (variant?: CalloutVariant) => ReturnType };
    relatedPost: { insertRelatedPost: (postId: string) => ReturnType };
  }
}

/** Ảnh dạng khối có chú thích (figure + figcaption); alt bắt buộc */
const CaptionImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: null, parseHTML: (el) => el.getAttribute('data-caption'), renderHTML: (a) => (a.caption ? { 'data-caption': a.caption } : {}) },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
}).configure({ inline: false, allowBase64: false });

/** Hộp lưu ý kỹ thuật (info / warning / tip) chứa các khối con */
const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return { variant: { default: 'info', parseHTML: (el) => el.getAttribute('data-variant') ?? 'info' } };
  },
  parseHTML: () => [{ tag: 'div[data-callout]' }],
  renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '', 'data-variant': HTMLAttributes.variant }), 0],
  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
  addCommands() {
    return {
      insertCallout:
        (variant = 'info') =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { variant }, content: [{ type: 'paragraph' }] }),
    };
  },
});

/** Hộp "Bài liên quan" chèn giữa bài (như báo điện tử) — chỉ lưu postId, trang public tự lấy tiêu đề/slug đúng ngôn ngữ */
const RelatedPost = Node.create({
  name: 'relatedPost',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { postId: { default: null, parseHTML: (el) => el.getAttribute('data-post-id') } };
  },
  parseHTML: () => [{ tag: 'div[data-related-post]' }],
  renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes({ 'data-related-post': '', 'data-post-id': HTMLAttributes.postId })],
  addNodeView() {
    return ReactNodeViewRenderer(RelatedPostNodeView);
  },
  addCommands() {
    return {
      insertRelatedPost:
        (postId) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { postId } }),
    };
  },
});

export function richTextExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [...HEADING_LEVELS] },
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: null } },
    }),
    CaptionImage,
    TableKit.configure({ table: { resizable: false } }),
    Youtube.configure({ nocookie: true, controls: true, width: 640, height: 360 }),
    Callout,
    RelatedPost,
  ];
}
