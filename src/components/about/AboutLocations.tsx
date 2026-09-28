'use client';

import { useState } from 'react';
import { Warehouse, Building2, Factory, MapPin, ExternalLink } from 'lucide-react';

type LocationDef = {
  icon: React.ElementType;
  type: string;
  addr: string;
  mapQuery: string;
  badge?: string;
  highlight?: boolean;
};

const LOCATIONS: LocationDef[] = [
  {
    icon: Warehouse,
    type: 'Kho & VP Hà Nội',
    addr: 'Cụm CN Lại Yên, Xã Sơn Đồng, TP Hà Nội',
    mapQuery: 'Cụm Công Nghiệp Lại Yên, Sơn Đồng, Hoài Đức, Hà Nội',
    badge: 'HQ',
    highlight: true,
  },
  {
    icon: Building2,
    type: 'Văn phòng Trường Chinh',
    addr: '36, ngõ 120 Trường Chinh, P. Kim Liên, HN',
    mapQuery: '120 Trường Chinh, Kim Liên, Đống Đa, Hà Nội',
  },
  {
    icon: Factory,
    type: 'Nhà máy Phú Thọ',
    addr: 'KCN Bình Phú, P. Kỳ Sơn, Tỉnh Phú Thọ',
    mapQuery: 'KCN Bình Phú, Kỳ Sơn, Phú Thọ',
  },
  {
    icon: Warehouse,
    type: 'Kho Đà Nẵng',
    addr: '575 Lê Văn Hiến, P. Ngũ Hành Sơn, TP Đà Nẵng',
    mapQuery: '575 Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
  },
  {
    icon: Building2,
    type: 'Chi nhánh HCM',
    addr: '181/7 Đường Công Khi, Ấp 9, Xã Hóc Môn, TP.HCM',
    mapQuery: 'Đường Công Khi, Hóc Môn, Thành phố Hồ Chí Minh',
  },
];

export default function AboutLocations() {
  const [selected, setSelected] = useState(0);

  const loc = LOCATIONS[selected];
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(loc.mapQuery)}&output=embed&hl=vi&z=15`;
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(loc.mapQuery)}`;

  return (
    <div className="bg-slate-50 border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 lg:py-14">

        {/* Heading row */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Văn Phòng & Kho Hàng</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
            5 điểm hiện diện từ Bắc vào Nam — đảm bảo giao hàng đúng tiến độ và hỗ trợ kỹ thuật tại hiện trường.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
            <div className="w-2 h-2 rounded-full bg-[#7CB305]" />
            <span>Giờ làm việc: T2–CN · 8:00–12:00 & 13:30–17:30</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">

          {/* Left — location list */}
          <div className="space-y-2.5">
            {LOCATIONS.map(({ icon: Icon, type, addr, badge, highlight }, i) => {
              const isActive = selected === i;
              return (
                <button
                  key={type}
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-150 ${
                    isActive
                      ? highlight
                        ? 'border-[#7CB305] bg-[#F4F9E8] shadow-sm shadow-[#7CB305]/20'
                        : 'border-slate-400 bg-white shadow-sm'
                      : highlight
                        ? 'border-[#7CB305]/30 bg-[#F4F9E8]/60 hover:border-[#7CB305]/60'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? highlight ? 'bg-[#5F8A03]' : 'bg-slate-800'
                      : highlight ? 'bg-[#5F8A03]' : 'bg-slate-100'
                  }`}>
                    <Icon size={15} className={isActive || highlight ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold mb-0.5 ${highlight ? 'text-[#5F8A03]' : 'text-slate-800'}`}>{type}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{addr}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {badge && (
                      <span className="text-[9px] font-black bg-[#5F8A03] text-white px-1.5 py-0.5 rounded">
                        {badge}
                      </span>
                    )}
                    <MapPin size={14} className={`transition-colors ${isActive ? 'text-[#5F8A03]' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right — map panel */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100" style={{ height: 340 }}>
              <iframe
                key={selected}
                src={mapSrc}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Bản đồ ${loc.type}`}
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800">{loc.type}</p>
                <p className="text-xs text-slate-500 mt-0.5">{loc.addr}</p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#5F8A03] hover:underline"
              >
                <ExternalLink size={11} /> Mở Google Maps
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
