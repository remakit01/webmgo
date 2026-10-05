import React from 'react';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { isInternalLink } from '@remak/shared/link';
import { extractHeadings, nodeText, youtubeId, type CalloutVariant, type RichDoc, type RichMark, type RichNode } from '@remak/shared/rich-content';
import type { NewsRelatedRef } from '@remak/shared/contracts/news';
import Link from '@/components/ui/LocaleLink';

/**
 * Render nội dung RichDoc (TipTap JSON) phía server — chỉ các khối trong whitelist @remak/shared/rich-content,
 * không dùng dangerouslySetInnerHTML. Khối lạ bị bỏ qua. id tiêu đề khớp extractHeadings() để mục lục link đúng.
 */
export default async function RichContent({
  doc,
  relatedRefs = {},
  className = '',
}: {
  doc: RichDoc;
  /** Bài được chèn qua khối "bài liên quan" (đúng ngôn ngữ, đang hiển thị) */
  relatedRefs?: Record<string, NewsRelatedRef>;
  className?: string;
}) {
  const t = await getTranslations('News');
  const headingIds = extractHeadings(doc).map((h) => h.id);
  let headingIndex = 0;

  const calloutLabel: Record<CalloutVariant, string> = {
    info: t('callout.info'),
    warning: t('callout.warning'),
    tip: t('callout.tip'),
  };

  function renderMarks(text: React.ReactNode, marks: RichMark[] = [], key: React.Key): React.ReactNode {
    return marks.reduceRight<React.ReactNode>((child, mark, i) => {
      const k = `${String(key)}-${i}`;
      switch (mark.type) {
        case 'bold':
          return <strong key={k}>{child}</strong>;
        case 'italic':
          return <em key={k}>{child}</em>;
        case 'underline':
          return <u key={k}>{child}</u>;
        case 'strike':
          return <s key={k}>{child}</s>;
        case 'code':
          return <code key={k}>{child}</code>;
        case 'subscript':
          return <sub key={k}>{child}</sub>;
        case 'superscript':
          return <sup key={k}>{child}</sup>;
        case 'link': {
          const href = mark.attrs?.href ?? '#';
          if (isInternalLink(href)) return <Link key={k} href={href}>{child}</Link>;
          if (href.startsWith('#')) return <a key={k} href={href}>{child}</a>;
          return (
            <a key={k} href={href} target="_blank" rel="noopener noreferrer nofollow">
              {child}
            </a>
          );
        }
        default:
          return child;
      }
    }, text);
  }

  function children(node: RichNode, key: string) {
    return (node.content ?? []).map((child, i) => render(child, `${key}.${i}`));
  }

  function render(node: RichNode, key: string): React.ReactNode {
    switch (node.type) {
      case 'text':
        return renderMarks(node.text ?? '', node.marks, key);
      case 'hardBreak':
        return <br key={key} />;
      case 'paragraph':
        return node.content?.length ? <p key={key}>{children(node, key)}</p> : null;
      case 'heading': {
        const level = Number(node.attrs?.level ?? 2);
        const Tag = (level === 3 ? 'h3' : level === 4 ? 'h4' : 'h2') as 'h2' | 'h3' | 'h4';
        const id = nodeText(node).trim() ? headingIds[headingIndex++] : undefined;
        return (
          <Tag key={key} id={id} className="scroll-mt-24">
            {children(node, key)}
          </Tag>
        );
      }
      case 'bulletList':
        return <ul key={key}>{children(node, key)}</ul>;
      case 'orderedList':
        return (
          <ol key={key} start={typeof node.attrs?.start === 'number' ? node.attrs.start : undefined}>
            {children(node, key)}
          </ol>
        );
      case 'listItem':
        return <li key={key}>{children(node, key)}</li>;
      case 'blockquote':
        return <blockquote key={key}>{children(node, key)}</blockquote>;
      case 'horizontalRule':
        return <hr key={key} />;
      case 'image': {
        const src = typeof node.attrs?.src === 'string' ? node.attrs.src : null;
        if (!src) return null;
        const caption = typeof node.attrs?.caption === 'string' ? node.attrs.caption : null;
        const width = typeof node.attrs?.width === 'number' ? node.attrs.width : undefined;
        const height = typeof node.attrs?.height === 'number' ? node.attrs.height : undefined;
        return (
          <figure key={key}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO đã tối ưu WebP sẵn (xem ResponsivePicture) */}
            <img src={src} alt={String(node.attrs?.alt ?? '')} width={width} height={height} loading="lazy" decoding="async" />
            {caption && <figcaption>{caption}</figcaption>}
          </figure>
        );
      }
      case 'table':
        return (
          <div key={key} className="news-table-wrap">
            <table>
              <tbody>{children(node, key)}</tbody>
            </table>
          </div>
        );
      case 'tableRow':
        return <tr key={key}>{children(node, key)}</tr>;
      case 'tableHeader':
      case 'tableCell': {
        const Cell = node.type === 'tableHeader' ? 'th' : 'td';
        return (
          <Cell
            key={key}
            colSpan={typeof node.attrs?.colspan === 'number' && node.attrs.colspan > 1 ? node.attrs.colspan : undefined}
            rowSpan={typeof node.attrs?.rowspan === 'number' && node.attrs.rowspan > 1 ? node.attrs.rowspan : undefined}
            scope={node.type === 'tableHeader' ? 'col' : undefined}
          >
            {children(node, key)}
          </Cell>
        );
      }
      case 'youtube': {
        const id = typeof node.attrs?.src === 'string' ? youtubeId(node.attrs.src) : null;
        if (!id) return null;
        const start = typeof node.attrs?.start === 'number' && node.attrs.start > 0 ? `?start=${node.attrs.start}` : '';
        return (
          <div key={key} className="news-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}${start}`}
              title="YouTube video"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        );
      }
      case 'callout': {
        const variant = (['info', 'warning', 'tip'].includes(String(node.attrs?.variant)) ? node.attrs?.variant : 'info') as CalloutVariant;
        const Icon = variant === 'warning' ? TriangleAlert : variant === 'tip' ? Lightbulb : Info;
        return (
          <aside key={key} className={`news-callout news-callout-${variant}`}>
            <p className="news-callout-label">
              <Icon size={16} aria-hidden="true" /> {calloutLabel[variant]}
            </p>
            {children(node, key)}
          </aside>
        );
      }
      case 'relatedPost': {
        const ref = typeof node.attrs?.postId === 'string' ? relatedRefs[node.attrs.postId] : undefined;
        if (!ref) return null; // bài liên quan chưa đăng ở ngôn ngữ này -> ẩn khối
        return (
          <Link key={key} href={`/tin-tuc/${ref.slug}`} className="news-related-inline group">
            {ref.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnail MinIO
              <img src={ref.coverUrl} alt="" loading="lazy" />
            )}
            <span>
              <span className="news-related-inline-label">{t('relatedInline')}</span>
              <span className="news-related-inline-title">{ref.title}</span>
            </span>
            <ArrowRight size={16} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        );
      }
      default:
        return null;
    }
  }

  return <div className={`news-prose ${className}`}>{doc.content.map((node, i) => render(node, String(i)))}</div>;
}
