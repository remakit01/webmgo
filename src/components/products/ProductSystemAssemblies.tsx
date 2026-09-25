import React from 'react';
import { Flame } from 'lucide-react';
import { ProductSystemAssembly } from '@/types';

interface ProductSystemAssembliesProps {
  assemblies: ProductSystemAssembly[];
}

export default function ProductSystemAssemblies({ assemblies }: ProductSystemAssembliesProps) {
  if (!assemblies || assemblies.length === 0) return null;

  return (
    <div>
      <div className="border-b border-slate-200 pb-3 mb-6">
        <span className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider bg-[#F4F9E8] px-3 py-1 rounded-full">
          Cẩm Nang Thi Công Kỹ Thuật
        </span>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
          Cấu Tạo Hệ Thống Đạt Chuẩn Nghiệm Thu PCCC
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sơ đồ lớp vật liệu theo đúng biên bản thử nghiệm đốt mẫu tại Viện KHCN Xây Dựng (IBST)
        </p>
      </div>

      <div className="space-y-6">
        {assemblies.map((assembly, aIdx) => (
          <div 
            key={aIdx} 
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#7CB305]/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Flame size={20} className="text-[#F26522]" />
                <span>{assembly.title}</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#FEF3EC] text-[#F26522] font-bold text-xs inline-flex items-center gap-1 self-start sm:self-auto">
                {assembly.fireRating}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 italic leading-relaxed">
              {assembly.description}
            </p>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Trình tự các lớp vật tư:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {assembly.layers.map((layer, lIdx) => (
                  <div 
                    key={lIdx} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#5F8A03] text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                      {lIdx + 1}
                    </span>
                    <span className="font-medium">{layer}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
