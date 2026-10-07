'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Newspaper,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
  Unlink,
  Video,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
} from 'lucide-react';
import { isSafeLink } from '@remak/shared/link';
import { stableStringify, youtubeId, type RichDoc } from '@remak/shared/rich-content';
import { richTextExtensions } from './extensions';
import RelatedPostPicker from './RelatedPostPicker';

export interface RichTextEditorProps {
  value: RichDoc;
  onChange: (doc: RichDoc) => void;
  /** Tải ảnh lên máy chủ, trả URL (ảnh phải nằm trên MinIO của hệ thống) */
  onUploadImage: (file: File) => Promise<string>;
  /** Bài hiện tại — loại khỏi danh sách chọn "bài liên quan" */
  currentPostId?: string;
  editable?: boolean;
  ariaLabel?: string;
  embedded?: boolean;
}

type InlineInput = { kind: 'link' | 'youtube'; value: string; error?: string } | null;

/** Trình soạn bài theo khối (TipTap) — xuất JSON RichDoc, không xuất HTML */
export default function RichTextEditor({ value, onChange, onUploadImage, currentPostId, editable = true, ariaLabel = 'Nội dung bài viết', embedded = false }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inline, setInline] = useState<InlineInput>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const lastEmitted = useRef<string>(stableStringify(value));
  // onUpdate của TipTap giữ closure lúc tạo editor -> đọc onChange mới nhất qua ref
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: richTextExtensions(),
    content: value,
    editable,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        'aria-multiline': 'true',
        role: 'textbox',
        class: 'rich-text-editor-content min-h-[420px] px-5 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => {
      const doc = e.getJSON() as RichDoc;
      lastEmitted.current = stableStringify(doc);
      onChangeRef.current(doc);
    },
  });

  // Nội dung đổi từ bên ngoài (đổi tab ngôn ngữ, tải bản mới nhất, AI dịch) -> nạp lại vào editor
  useEffect(() => {
    if (!editor) return;
    const incoming = stableStringify(value);
    if (incoming !== lastEmitted.current) {
      lastEmitted.current = incoming;
      // Node view React (ảnh, hộp lưu ý...) render bằng flushSync -> không gọi đồng bộ trong effect
      queueMicrotask(() => {
        if (!editor.isDestroyed) editor.commands.setContent(value, { emitUpdate: false });
      });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await onUploadImage(file);
      // alt mặc định từ tên file để không bỏ trống; biên tập viên sửa lại ngay dưới ảnh
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      editor.chain().focus().setImage({ src: url, alt }).run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không tải được ảnh');
    } finally {
      setUploading(false);
    }
  };

  const submitInline = () => {
    if (!editor || !inline) return;
    const val = inline.value.trim();
    if (inline.kind === 'link') {
      if (!val) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return setInline(null);
      }
      const href = /^(https?:\/\/|\/|#)/.test(val) ? val : `https://${val}`;
      if (!isSafeLink(href, { allowAnchor: true })) return setInline({ ...inline, error: 'Link phải bắt đầu bằng /, # hoặc https://' });
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    } else {
      if (!youtubeId(val)) return setInline({ ...inline, error: 'Dán link YouTube, vd https://www.youtube.com/watch?v=…' });
      editor.chain().focus().setYoutubeVideo({ src: val }).run();
    }
    setInline(null);
  };

  if (!editor) {
    return <div className={`min-h-[480px] bg-white animate-pulse ${embedded ? '' : 'rounded-xl border border-slate-200'}`} aria-busy="true" />;
  }

  return (
    <div className={embedded ? 'bg-white' : 'rounded-xl border border-slate-200 bg-white shadow-xs focus-within:border-[#5F8A03] transition-colors'}>
      {editable && (
        <Toolbar
          editor={editor}
          uploading={uploading}
          onImage={() => fileRef.current?.click()}
          onLink={() => setInline({ kind: 'link', value: (editor.getAttributes('link').href as string | undefined) ?? '' })}
          onYoutube={() => setInline({ kind: 'youtube', value: '' })}
          onRelated={() => setPickerOpen(true)}
        />
      )}

      {inline && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50">
          <label htmlFor={inputId} className="text-[11px] font-bold text-slate-600 shrink-0">
            {inline.kind === 'link' ? 'Đường dẫn' : 'Link YouTube'}
          </label>
          <input
            id={inputId}
            autoFocus
            value={inline.value}
            onChange={(e) => setInline({ ...inline, value: e.target.value, error: undefined })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitInline();
              } else if (e.key === 'Escape') setInline(null);
            }}
            placeholder={inline.kind === 'link' ? '/san-pham hoặc https://… (bỏ trống để gỡ link)' : 'https://www.youtube.com/watch?v=…'}
            aria-invalid={!!inline.error}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
          />
          <button type="button" onClick={submitInline} className="px-3 py-1.5 rounded-md bg-[#5F8A03] text-white text-xs font-bold cursor-pointer">
            Áp dụng
          </button>
          <button type="button" onClick={() => setInline(null)} className="px-2 py-1.5 text-xs text-slate-500 cursor-pointer">
            Huỷ
          </button>
          {inline.error && <span role="alert" className="text-[11px] font-semibold text-rose-600">{inline.error}</span>}
        </div>
      )}

      {uploadError && (
        <p role="alert" className="px-4 py-2 text-xs font-semibold text-rose-600 border-b border-rose-100 bg-rose-50">
          Không tải được ảnh: {uploadError}
        </p>
      )}

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <RelatedPostPicker
        open={pickerOpen}
        excludeId={currentPostId}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          editor.chain().focus().insertRelatedPost(id).run();
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function Toolbar({
  editor,
  uploading,
  onImage,
  onLink,
  onYoutube,
  onRelated,
}: {
  editor: Editor;
  uploading: boolean;
  onImage: () => void;
  onLink: () => void;
  onYoutube: () => void;
  onRelated: () => void;
}) {
  // Chỉ render lại thanh công cụ khi trạng thái nút đổi (không render lại cả editor mỗi lần gõ)
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      h4: e.isActive('heading', { level: 4 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      link: e.isActive('link'),
      alignLeft: e.isActive({ textAlign: 'left' }),
      alignCenter: e.isActive({ textAlign: 'center' }),
      alignRight: e.isActive({ textAlign: 'right' }),
      alignJustify: e.isActive({ textAlign: 'justify' }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      inTable: e.isActive('table'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const c = () => editor.chain().focus();

  return (
    <div role="toolbar" aria-label="Định dạng nội dung" className="sticky top-16 z-10 flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Btn label="Tiêu đề lớn (H2)" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()} icon={Heading2} />
      <Btn label="Tiêu đề nhỏ (H3)" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()} icon={Heading3} />
      <Btn label="Tiêu đề mục (H4)" active={s.h4} onClick={() => c().toggleHeading({ level: 4 }).run()} icon={Heading4} />
      <Sep />
      <Btn label="In đậm (Ctrl+B)" active={s.bold} onClick={() => c().toggleBold().run()} icon={Bold} />
      <Btn label="In nghiêng (Ctrl+I)" active={s.italic} onClick={() => c().toggleItalic().run()} icon={Italic} />
      <Btn label="Gạch chân (Ctrl+U)" active={s.underline} onClick={() => c().toggleUnderline().run()} icon={Underline} />
      <Btn label="Gạch ngang" active={s.strike} onClick={() => c().toggleStrike().run()} icon={Strikethrough} />
      <Btn label="Chèn/sửa link" active={s.link} onClick={onLink} icon={Link2} />
      {s.link && <Btn label="Gỡ link" onClick={() => c().extendMarkRange('link').unsetLink().run()} icon={Unlink} />}
      <Sep />
      <Btn label="Căn lề trái (Ctrl+Shift+L)" active={s.alignLeft} onClick={() => c().setTextAlign('left').run()} icon={AlignLeft} />
      <Btn label="Căn giữa (Ctrl+Shift+E)" active={s.alignCenter} onClick={() => c().setTextAlign('center').run()} icon={AlignCenter} />
      <Btn label="Căn lề phải (Ctrl+Shift+R)" active={s.alignRight} onClick={() => c().setTextAlign('right').run()} icon={AlignRight} />
      <Btn label="Căn đều 2 bên (Ctrl+Shift+J)" active={s.alignJustify} onClick={() => c().setTextAlign('justify').run()} icon={AlignJustify} />
      <Sep />
      <Btn label="Danh sách chấm" active={s.bullet} onClick={() => c().toggleBulletList().run()} icon={List} />
      <Btn label="Danh sách số" active={s.ordered} onClick={() => c().toggleOrderedList().run()} icon={ListOrdered} />
      <Btn label="Trích dẫn" active={s.quote} onClick={() => c().toggleBlockquote().run()} icon={Quote} />
      <Sep />
      <Btn label="Chèn ảnh (kèm chú thích)" onClick={onImage} icon={uploading ? Loader2 : ImagePlus} spin={uploading} disabled={uploading} />
      <Btn label="Chèn bảng 3×3" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={Table} />
      <Btn label="Nhúng video YouTube" onClick={onYoutube} icon={Video} />
      <Btn label="Tóm tắt nhanh (key takeaways — nên đặt đầu bài)" onClick={() => c().insertCallout('summary').run()} icon={ListChecks} />
      <Btn label="Hộp lưu ý kỹ thuật" onClick={() => c().insertCallout('info').run()} icon={Lightbulb} />
      <Btn label="Khối câu hỏi thường gặp (FAQ)" onClick={() => c().insertFaq().run()} icon={MessageCircleQuestion} />
      <Btn label="Chèn hộp bài liên quan" onClick={onRelated} icon={Newspaper} />
      <Btn label="Đường kẻ ngang" onClick={() => c().setHorizontalRule().run()} icon={Minus} />
      <Sep />
      <Btn label="Hoàn tác (Ctrl+Z)" onClick={() => c().undo().run()} icon={Undo2} disabled={!s.canUndo} />
      <Btn label="Làm lại (Ctrl+Shift+Z)" onClick={() => c().redo().run()} icon={Redo2} disabled={!s.canRedo} />

      {s.inTable && (
        <div className="w-full flex flex-wrap items-center gap-1 pt-1 mt-1 border-t border-slate-100 text-[11px]">
          <span className="font-bold text-slate-500 mr-1">Bảng:</span>
          {[
            ['+ Hàng dưới', () => c().addRowAfter().run()],
            ['+ Cột phải', () => c().addColumnAfter().run()],
            ['Xoá hàng', () => c().deleteRow().run()],
            ['Xoá cột', () => c().deleteColumn().run()],
            ['Bật/tắt hàng tiêu đề', () => c().toggleHeaderRow().run()],
            ['Xoá bảng', () => c().deleteTable().run()],
          ].map(([label, run]) => (
            <button
              key={label as string}
              type="button"
              onClick={run as () => void}
              className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {label as string}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Btn({
  label,
  icon: Icon,
  onClick,
  active,
  disabled,
  spin,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  spin?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 sm:p-2 rounded-md transition-colors cursor-pointer border ${
        active ? 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/40 font-bold' : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <Icon size={16} className={spin ? 'animate-spin' : undefined} />
    </button>
  );
}

const Sep = () => <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />;
