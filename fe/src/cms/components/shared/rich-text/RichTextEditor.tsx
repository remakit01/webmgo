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
import { useToast } from '@/cms/components/ConfirmDialog';
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
  const showToast = useToast();
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
        spellcheck: 'false',
        autoCorrect: 'off',
        autoCapitalize: 'off',
        class: 'rich-text-editor-content min-h-[420px] px-5 py-4 focus:outline-none',
      },
      handleDrop: (_view, event) => {
        const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0;
        if (hasFiles) {
          const imageFiles = Array.from(event.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
          if (imageFiles.length > 0) {
            event.preventDefault();
            void handleFiles(imageFiles);
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          const files: File[] = [];
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) files.push(file);
            }
          }
          if (files.length > 0) {
            event.preventDefault();
            void handleFiles(files);
            return true;
          }
        }
        return false;
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

  const [uploadProgress, setUploadProgress] = useState<{ total: number; done: number; currentFileName?: string } | null>(null);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || !editor) return;
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress({ total: fileList.length, done: 0, currentFileName: fileList[0]?.name });

    // Tạo blob URL xem trước tức thì và chèn ngay vào vị trí con trỏ (Optimistic UI)
    const items = fileList.map((file) => {
      const blobUrl = URL.createObjectURL(file);
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      return { file, blobUrl, alt };
    });

    // Chèn các thẻ ảnh blob tạm thời cùng dòng đệm paragraph ở giữa để không bị dính đè nhau
    const contentToInsert: Array<{ type: string; attrs?: Record<string, unknown> }> = [];
    items.forEach((item, index) => {
      contentToInsert.push({
        type: 'image',
        attrs: { src: item.blobUrl, alt: item.alt },
      });
      // Nếu có nhiều ảnh hoặc sau mỗi ảnh, thêm một dòng paragraph để người dùng có thể đặt con trỏ viết bài
      if (items.length > 1 || index === items.length - 1) {
        contentToInsert.push({ type: 'paragraph' });
      }
    });

    editor.chain().focus().insertContent(contentToInsert).run();

    const failedNames: string[] = [];
    let successCount = 0;

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setUploadProgress({ total: items.length, done: i, currentFileName: item.file.name });
        try {
          const finalUrl = await onUploadImage(item.file);
          // Cập nhật lại src của node tương ứng từ blobUrl sang finalUrl MinIO
          const { tr } = editor.state;
          let replaced = false;
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === item.blobUrl) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: finalUrl });
              replaced = true;
              return false;
            }
            return true;
          });
          if (replaced) {
            editor.view.dispatch(tr);
          }
          successCount++;
        } catch (err) {
          failedNames.push(item.file.name);
          // Nếu upload thất bại, gỡ bỏ node blob tương ứng khỏi editor để không lưu link hỏng
          const { tr } = editor.state;
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === item.blobUrl) {
              tr.delete(pos, pos + node.nodeSize);
              return false;
            }
            return true;
          });
          editor.view.dispatch(tr);
        } finally {
          URL.revokeObjectURL(item.blobUrl);
          setUploadProgress({ total: items.length, done: i + 1, currentFileName: items[i + 1]?.file.name });
        }
      }

      if (failedNames.length > 0) {
        const errorMsg = `Tải thất bại ${failedNames.length}/${items.length} ảnh (${failedNames.join(', ')})`;
        setUploadError(errorMsg);
        showToast(errorMsg, 'error');
      }
      
      if (successCount > 0 && failedNames.length === 0) {
        showToast(
          successCount === 1
            ? 'Đã chèn ảnh vào bài viết thành công'
            : `Đã chèn ${successCount} ảnh vào bài viết thành công`,
          'success',
        );
      } else if (successCount > 0 && failedNames.length > 0) {
        showToast(`Đã chèn được ${successCount} ảnh (bị lỗi ${failedNames.length} ảnh)`, 'warning');
      }
    } finally {
      setUploading(false);
      setUploadProgress(null);
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
          uploadProgress={uploadProgress}
          onImage={() => fileRef.current?.click()}
          onLink={() => setInline({ kind: 'link', value: (editor.getAttributes('link').href as string | undefined) ?? '' })}
          onYoutube={() => setInline({ kind: 'youtube', value: '' })}
          onRelated={() => setPickerOpen(true)}
        />
      )}

      {inline && (
        <div className="sticky top-[calc(4rem+41px+41px)] lg:top-[calc(4rem+41px)] z-20 flex items-center gap-2 px-3 py-2 border-b border-slate-300 bg-slate-50 shadow-xs">
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
        <div role="alert" className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 border-b border-rose-200 bg-rose-50 animate-in fade-in-50 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="p-1 rounded-md text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      {/* Floating Upload Progress Banner (hiển thị rõ ràng ở góc dưới khi đang upload) */}
      {uploadProgress && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#5F8A03]/20 border border-[#7CB305]/40 text-[#A3E635]">
            <Loader2 size={18} className="animate-spin" />
          </div>
          <div className="flex flex-col min-w-[200px] max-w-[320px]">
            <div className="flex items-center justify-between gap-3 text-xs font-bold">
              <span className="text-white">Đang tải ảnh ({uploadProgress.done}/{uploadProgress.total})</span>
              <span className="text-[#A3E635] tabular-nums font-mono text-[11px]">
                {Math.round((uploadProgress.done / uploadProgress.total) * 100)}%
              </span>
            </div>
            {uploadProgress.currentFileName && (
              <p className="text-[11px] text-slate-300 truncate mt-0.5" title={uploadProgress.currentFileName}>
                {uploadProgress.currentFileName}
              </p>
            )}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-[#5F8A03] to-[#7CB305] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        </aside>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
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
  uploadProgress,
  onImage,
  onLink,
  onYoutube,
  onRelated,
}: {
  editor: Editor;
  uploading: boolean;
  uploadProgress?: { total: number; done: number } | null;
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
    <div
      role="toolbar"
      aria-label="Định dạng nội dung"
      className="sticky top-[calc(4rem+41px)] lg:top-16 z-20 flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-slate-300 bg-white/95 backdrop-blur-sm shadow-xs"
    >
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
      <div className="relative inline-flex items-center">
        {uploading ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F9E8] border border-[#7CB305]/50 text-[#5F8A03] text-xs font-bold animate-pulse shadow-2xs">
            <Loader2 size={15} className="animate-spin text-[#5F8A03]" />
            <span className="tabular-nums">
              {uploadProgress ? `Đang tải ${uploadProgress.done}/${uploadProgress.total}` : 'Đang tải ảnh...'}
            </span>
          </div>
        ) : (
          <Btn
            label="Chèn một hoặc nhiều ảnh (kèm chú thích)"
            onClick={onImage}
            icon={ImagePlus}
          />
        )}
      </div>
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
