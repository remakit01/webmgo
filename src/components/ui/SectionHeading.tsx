import React from 'react';

interface SectionHeadingProps {
  badge?: string;
  badgeColor?: 'green' | 'orange';
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({
  badge,
  badgeColor = 'green',
  title,
  titleHighlight,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div className={`mb-10 sm:mb-12 ${isCenter ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'}`}>
      {badge && (
        <div className="mb-3">
          <span 
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
              badgeColor === 'orange' 
                ? 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/30' 
                : 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30'
            }`}
          >
            {badge}
          </span>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 tracking-tight leading-[1.25]">
        {title}{' '}
        {titleHighlight && (
          <span className={badgeColor === 'orange' ? 'text-[#F26522]' : 'text-[#7CB305]'}>
            {titleHighlight}
          </span>
        )}
      </h2>
      {subtitle && (
        <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
