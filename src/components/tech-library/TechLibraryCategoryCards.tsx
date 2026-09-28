import { X } from 'lucide-react';
import { DOC_TYPES, type DocType } from '@/data/documents';
import { TYPE_CONFIG } from './config';

interface TechLibraryCategoryCardsProps {
  activeType: DocType | 'all';
  counts: Record<string, number>;
  onSelect: (type: DocType | 'all') => void;
}

export default function TechLibraryCategoryCards({ activeType, counts, onSelect }: TechLibraryCategoryCardsProps) {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh Mục Tài Liệu</h2>
          <p className="text-xs text-slate-500 mt-0.5">Chọn danh mục hoặc tìm kiếm tài liệu bên trên</p>
        </div>
        {activeType !== 'all' && (
          <button
            onClick={() => onSelect('all')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
          >
            <X size={12} />
            Xem tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {(DOC_TYPES.filter(t => t.id !== 'all') as { id: DocType; label: string }[]).map(t => {
          const cfg = TYPE_CONFIG[t.id];
          const Icon = cfg.icon;
          const isActive = activeType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(isActive ? 'all' : t.id)}
              className={`group text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-[#5F8A03] bg-[#F4F9E8] shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                isActive ? 'bg-[#5F8A03]' : cfg.iconBg
              }`}>
                <Icon size={18} className={isActive ? 'text-white' : cfg.iconColor} />
              </div>
              <div className="font-bold text-slate-900 text-sm leading-snug mb-0.5">{cfg.label}</div>
              <div className={`text-[11px] font-black mb-2 ${isActive ? 'text-[#5F8A03]' : 'text-slate-400'}`}>
                {counts[t.id] ?? 0} tài liệu
              </div>
              <div className="text-[11px] text-slate-500 leading-snug hidden sm:block">{cfg.description}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
