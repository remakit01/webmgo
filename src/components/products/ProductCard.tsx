import React from 'react';
import Link from 'next/link';
import { Flame, CheckCircle2, ArrowRight, PhoneCall } from 'lucide-react';
import { ProductItem } from '@/types';

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:border-[#7CB305]/40">
      
      {/* Product Image & Badges */}
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F26522] text-white shadow-xs">
              {product.badge}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-[#5F8A03] backdrop-blur-xs shadow-xs">
            {product.categoryLabel}
          </span>
        </div>

        {/* Fire Rating Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
            <Flame size={13} className="text-[#F26522]" />
            {product.fireRating}
          </span>
          <span className="text-[11px] bg-emerald-600/90 px-2 py-1 rounded-md font-semibold">
            {product.density}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug">
            <Link href={`/san-pham/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          {/* Thickness Available */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Độ dày quy chuẩn (1220 x 2440mm):
            </div>
            <div className="flex flex-wrap gap-1">
              {product.thicknessList.map((th) => (
                <span 
                  key={th}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {th}
                </span>
              ))}
            </div>
          </div>

          {/* Highlights bullet points */}
          <div className="mt-4 space-y-1.5">
            {product.highlights.slice(0, 2).map((item, hIdx) => (
              <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 size={13} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions CTA */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
          <Link
            href={`/san-pham/${product.slug}`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl bg-[#F4F9E8] hover:bg-[#5F8A03] text-[#5F8A03] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Xem thông số & Cấu tạo</span>
            <ArrowRight size={13} />
          </Link>
          <a
            href="tel:0902441981"
            className="p-2.5 rounded-xl border border-slate-200 hover:border-[#F26522] hover:bg-[#FEF3EC] text-slate-600 hover:text-[#F26522] transition-colors"
            title="Gọi tư vấn kỹ thuật ngay"
          >
            <PhoneCall size={16} />
          </a>
        </div>

      </div>

    </div>
  );
}
