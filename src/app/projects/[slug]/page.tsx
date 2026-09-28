import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Ruler, Flame, CalendarCheck, Building2,
  ArrowLeft, ArrowRight, PhoneCall, FileCheck, CheckCircle2,
} from 'lucide-react';
import { PROJECTS } from '@/data/projects';
import type { ProjectItem } from '@/types';

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_ACCENTS: Record<ProjectItem['category'], {
  bar: string; badge: string; label: string; hover: string;
}> = {
  kcn:            { bar: 'from-[#7CB305] to-[#5F8A03]', badge: 'bg-[#5F8A03]',   label: 'bg-[#F4F9E8] text-[#5F8A03]', hover: 'hover:border-[#7CB305]/50' },
  commercial:     { bar: 'from-[#F26522] to-[#D95314]', badge: 'bg-[#D95314]',   label: 'bg-[#FEF3EC] text-[#D95314]', hover: 'hover:border-[#F26522]/50' },
  residential:    { bar: 'from-blue-500 to-blue-700',   badge: 'bg-blue-600',    label: 'bg-blue-50 text-blue-700',    hover: 'hover:border-blue-400/50' },
  infrastructure: { bar: 'from-slate-500 to-slate-700', badge: 'bg-slate-700',   label: 'bg-slate-100 text-slate-700', hover: 'hover:border-slate-400/50' },
};

const SPECS = [
  { label: 'Ứng dụng thi công',  key: 'application'   as const },
  { label: 'Chống cháy đạt chuẩn', key: 'fireRating'  as const },
  { label: 'Chủ đầu tư',         key: 'client'        as const },
  { label: 'Vị trí',             key: 'location'      as const },
  { label: 'Diện tích triển khai', key: 'scale'       as const },
  { label: 'Năm hoàn thành',     key: 'completedYear' as const },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: 'Không tìm thấy dự án' };
  return {
    title: `${project.name} | Remak® MGO FireOFF`,
    description: `${project.application} tại ${project.location}. Đạt chuẩn PCCC ${project.fireRating}. Hoàn thành ${project.completedYear}.`,
  };
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  const accent = CATEGORY_ACCENTS[project.category];
  const related = PROJECTS.filter(
    (p) => p.id !== project.id && p.category === project.category,
  ).slice(0, 2);

  const applicationHref = project.applicationSlug
    ? `/giai-phap-ung-dung/${project.applicationSlug}`
    : '/giai-phap-ung-dung';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero image */}
      <div className="relative h-[320px] sm:h-[420px] md:h-[500px] overflow-hidden bg-slate-200">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-5 left-0 right-0 max-w-[1440px] mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/du-an" className="hover:text-white transition-colors">Dự Án</Link>
            <span>/</span>
            <span className="text-white font-semibold truncate">{project.name}</span>
          </nav>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold text-white ${accent.badge} shadow-md`}>
              {project.categoryLabel}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#F26522] text-white shadow-md">
              {project.fireRating}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-black/50 backdrop-blur-sm text-white flex items-center gap-1">
              <CalendarCheck size={11} />
              {project.completedYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight max-w-3xl">
            {project.name}
          </h1>
          <div className="flex items-center gap-1.5 mt-2 text-sm text-white/80">
            <MapPin size={14} className="text-[#F26522]" />
            <span>{project.location}</span>
          </div>
        </div>
      </div>

      {/* Top color bar */}
      <div className={`h-1.5 bg-gradient-to-r ${accent.bar}`} />

      {/* Main content */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left: Spec card */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className={`h-1.5 bg-gradient-to-r ${accent.bar}`} />
              <div className="p-5">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Thông Số Dự Án</h2>
                <div className="space-y-3">
                  {SPECS.map(({ label, key }) => (
                    <div key={key} className="flex flex-col gap-0.5 py-2.5 border-b border-slate-100 last:border-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {String(project[key])}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stat strip */}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center mb-1"><Ruler size={14} className="text-slate-400" /></div>
                    <div className="text-sm font-black text-slate-900">{project.scale}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Diện tích</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center mb-1"><Flame size={14} className="text-[#F26522]" /></div>
                    <div className="text-sm font-black text-slate-900">{project.fireRating}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Chịu lửa</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-5 space-y-2">
                  <a
                    href="tel:0902441981"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors"
                  >
                    <PhoneCall size={14} />
                    <span>Hotline: 0902.441.981</span>
                  </a>
                  <Link
                    href="/bao-gia"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <FileCheck size={14} />
                    <span>Nhận Hồ Sơ Năng Lực</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detail content */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-8">

            {/* Back link */}
            <Link
              href="/du-an"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#5F8A03] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Quay lại danh sách dự án</span>
            </Link>

            {/* Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4">Tổng Quan Dự Án</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Remak® MGO FireOFF đã triển khai giải pháp <strong className="text-slate-800">{project.application}</strong> tại{' '}
                <strong className="text-slate-800">{project.name}</strong> ({project.location}),
                đạt tiêu chuẩn chịu lửa <strong className="text-[#5F8A03]">{project.fireRating}</strong>.
                Dự án được nghiệm thu PCCC hoàn thành năm <strong className="text-slate-800">{project.completedYear}</strong>,
                với toàn bộ hồ sơ kiểm định từ IBST và biên bản đốt mẫu đầy đủ.
              </p>

              {/* Checklist highlights */}
              <ul className="mt-5 space-y-2.5">
                {[
                  `Tổng diện tích thi công: ${project.scale}`,
                  `Tiêu chuẩn chịu lửa đạt được: ${project.fireRating}`,
                  'Hồ sơ kiểm định IBST đầy đủ, có công chứng',
                  'Bản vẽ CAD hoàn công theo thực tế thi công',
                  'Nghiệm thu PCCC cấp tỉnh/thành phố',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application link */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Giải Pháp Thi Công Áp Dụng</p>
                <p className="text-base font-extrabold text-white">{project.application}</p>
                <p className="text-xs text-slate-400 mt-1">Xem hướng dẫn kỹ thuật, bản vẽ CAD và quy trình thi công</p>
              </div>
              <Link
                href={applicationHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex-shrink-0"
              >
                <span>Xem Giải Pháp</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Related projects */}
            {related.length > 0 && (
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" />
                  Dự Án Cùng Loại
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((rel) => {
                    const relAccent = CATEGORY_ACCENTS[rel.category];
                    return (
                      <Link
                        key={rel.id}
                        href={`/du-an/${rel.slug}`}
                        className={`group bg-white rounded-2xl border border-slate-200 ${relAccent.hover} hover:shadow-lg transition-all overflow-hidden`}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                          <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                        </div>
                        <div className={`h-1 bg-gradient-to-r ${relAccent.bar}`} />
                        <div className="p-4">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug line-clamp-2">{rel.name}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin size={11} className="flex-shrink-0" />
                            {rel.location}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
