import React from 'react';

export interface AuthorBoxData {
  name: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  bio: string | null;
}

/** Hộp tác giả chỉ hiện khi có chức danh hoặc tiểu sử (dùng chung cho trang bài và bản xem trước trong CMS) */
export const hasAuthorBox = (a: Pick<AuthorBoxData, 'jobTitle' | 'bio'>) => Boolean(a.jobTitle || a.bio);

/**
 * Hộp tác giả (E-E-A-T) cuối bài viết: chuyên gia đứng tên bài.
 * Dùng chung trang bài public và khung xem trước ở CMS (Tag & Tác giả) — CMS thấy đúng như website.
 */
export default function AuthorBox({ author, label }: { author: AuthorBoxData; label: string }) {
  return (
    <section aria-label={label} className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      {author.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO đã tối ưu
        <img src={author.avatarUrl} alt={author.name} width={56} height={56} loading="lazy" className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0" />
      ) : (
        <span aria-hidden="true" className="w-14 h-14 rounded-full bg-remak-green-light text-remak-green-dark font-black text-xl flex items-center justify-center shrink-0">
          {author.name.charAt(0)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-900">
          {author.name}
          {author.jobTitle && <span className="font-medium text-slate-600"> · {author.jobTitle}</span>}
        </p>
        {author.bio && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{author.bio}</p>}
      </div>
    </section>
  );
}
