'use client';

import React, { useState } from 'react';
import Link from '@/components/ui/LocaleLink';
import {
  FileCode2,
  Download,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  FolderArchive,
} from 'lucide-react';

interface CadItem {
  id: string;
  title: string;
  category: 'cad' | 'cert' | 'spec';
  format: 'DWG' | 'PDF' | 'BIM';
  size: string;
  description: string;
  ratingBadge: string;
  downloadUrl: string;
}

const CAD_LIBRARY: CadItem[] = [
  {
    id: 'cad-duct-ei60',
    title: 'Bản Vẽ Chi Tiết Mặt Cắt Bọc Ống Gió PCCC EI 60 - EI 120',
    category: 'cad',
    format: 'DWG',
    size: '2.8 MB',
    description: 'Chi tiết liên kết tôn ống, lớp bông Rockwool 50mm, tấm MGO Remak 8-10mm và nẹp góc V kẹp.',
    ratingBadge: 'EI 60 - EI 120',
    downloadUrl: '/tai-lieu/cad-boc-ong-gio-mgo-remak.dwg',
  },
  {
    id: 'cad-wall-ei120',
    title: 'Bản Vẽ Mặt Cắt Chi Tiết Vách Ngăn Chống Cháy 2 Mặt Tấm MGO',
    category: 'cad',
    format: 'DWG',
    size: '3.1 MB',
    description: 'Mặt cắt khung thép C75/C100 bước 400mm, 2 lớp MGO 10mm mỗi mặt, chi tiết chân vách và đỉnh trần giáp mí.',
    ratingBadge: 'EI 60 - EI 120',
    downloadUrl: '/tai-lieu/cad-vach-ngan-mgo-remak.dwg',
  },
  {
    id: 'cad-floor-rei180',
    title: 'Bản Vẽ Chi Tiết Sàn Chịu Lực Nhà Thép Tấm MGO 18mm / 20mm',
    category: 'cad',
    format: 'DWG',
    size: '2.4 MB',
    description: 'Khoảng cách xà gồ thép 400x400mm hoặc 400x600mm, liên kết vít âm đầu, xử lý mối nối chống võng sàn.',
    ratingBadge: 'REI 180',
    downloadUrl: '/tai-lieu/cad-san-chieu-luc-mgo-remak.dwg',
  },
  {
    id: 'cert-ibst-duct',
    title: 'Kết Quả Thử Nghiệm Chịu Lửa Hệ Ống Gió – Viện KHCN Xây Dựng (IBST)',
    category: 'cert',
    format: 'PDF',
    size: '4.2 MB',
    description: 'Biên bản thử nghiệm đốt mẫu lò thực tế đạt EI 60 và EI 120 theo QCVN 06:2022/BXD và ISO 6944-1.',
    ratingBadge: 'Chứng Thư IBST',
    downloadUrl: '/tai-lieu/chung-thu-dot-lo-ong-gio-ibst-remak.pdf',
  },
  {
    id: 'cert-ibst-wall',
    title: 'Kết Quả Thử Nghiệm Chịu Lửa Tường Vách Ngăn Cháy Phẳng (IBST)',
    category: 'cert',
    format: 'PDF',
    size: '3.8 MB',
    description: 'Thử nghiệm khả năng toàn vẹn (E) và cách nhiệt (I) lò đốt đứng đạt 120 phút liên tục không nứt vỡ.',
    ratingBadge: 'Chứng Thư IBST',
    downloadUrl: '/tai-lieu/chung-thu-dot-lo-vach-ngan-ibst-remak.pdf',
  },
  {
    id: 'cert-corrosion',
    title: 'Chứng Thư Kiểm Nghiệm Hàm Lượng Clorua 0% – Không Ăn Mòn Kim Loại',
    category: 'cert',
    format: 'PDF',
    size: '1.9 MB',
    description: 'Kết quả phân tích thành phần hóa học công thức Sulfate Magie triệt tiêu muối ngậm ẩm làm rỉ ốc vít tôn kẽm.',
    ratingBadge: 'Zero Chloride',
    downloadUrl: '/tai-lieu/kiem-dinh-khong-an-mon-remak-mgo.pdf',
  },
  {
    id: 'spec-method-statement',
    title: 'Biện Pháp Thi Công & Nghiệm Thu Hệ Thống Chống Cháy MGO Remak®',
    category: 'spec',
    format: 'PDF',
    size: '5.5 MB',
    description: 'Quy trình đệ trình hồ sơ vật liệu vào công trình, danh mục checklist nghiệm thu với Tư Vấn Giám Sát và Cảnh Sát PCCC.',
    ratingBadge: 'Checklist TVGS',
    downloadUrl: '/tai-lieu/bien-phap-thi-cong-nghiem-thu-pccc-remak.pdf',
  },
  {
    id: 'spec-safety-tds',
    title: 'Bảng Dữ Liệu Kỹ Thuật (TDS) & Chỉ Dẫn An Toàn Vật Liệu (MSDS)',
    category: 'spec',
    format: 'PDF',
    size: '2.1 MB',
    description: 'Thông số cơ lý tính chi tiết: tỷ trọng, độ uốn, độ co ngót, hệ số truyền nhiệt K, độc tính khói 0%.',
    ratingBadge: 'TDS / MSDS',
    downloadUrl: '/tai-lieu/tds-msds-tam-chong-chay-mgo-remak.pdf',
  },
];

const CATEGORY_ACCENTS = {
  cad: {
    bar: 'bg-gradient-to-r from-blue-500 to-blue-700',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/25',
    Icon: FileCode2,
    formatBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    cardHover: 'hover:border-blue-400/50 hover:shadow-blue-50',
  },
  cert: {
    bar: 'bg-gradient-to-r from-[#F26522] to-[#D95314]',
    iconBg: 'bg-gradient-to-br from-[#F26522] to-[#D95314] shadow-[#F26522]/25',
    Icon: FileCheck2,
    formatBadge: 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/30',
    cardHover: 'hover:border-[#F26522]/50 hover:shadow-orange-50',
  },
  spec: {
    bar: 'bg-gradient-to-r from-slate-500 to-slate-700',
    iconBg: 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/25',
    Icon: FileText,
    formatBadge: 'bg-slate-100 text-slate-600 border-slate-300',
    cardHover: 'hover:border-slate-400/50 hover:shadow-slate-50',
  },
};

export default function ApplicationCadDownload({
  filterCategory: _filterCategory,
}: {
  filterCategory?: string;
}) {
  const [activeTab, setActiveTab] = useState<'all' | 'cad' | 'cert' | 'spec'>('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredItems = activeTab === 'all'
    ? CAD_LIBRARY
    : CAD_LIBRARY.filter((item) => item.category === activeTab);

  const handleDownload = (item: CadItem) => {
    setDownloadSuccessId(item.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  const TABS = [
    { id: 'all',  label: 'Tất Cả', count: CAD_LIBRARY.length },
    { id: 'cad',  label: 'Bản Vẽ CAD (.DWG)', count: CAD_LIBRARY.filter(i => i.category === 'cad').length },
    { id: 'cert', label: 'Chứng Thư IBST',    count: CAD_LIBRARY.filter(i => i.category === 'cert').length },
    { id: 'spec', label: 'Checklist TVGS',     count: CAD_LIBRARY.filter(i => i.category === 'spec').length },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden my-10 shadow-sm">

      {/* Section Header — gradient dark */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Bản Vẽ CAD (.DWG) & Hồ Sơ Đốt Lò IBST
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            File CAD mặt cắt cấu tạo cho kiến trúc sư và hồ sơ nghiệm thu thực tế cho nhà thầu PCCC
          </p>
        </div>
        <Link
          href="/bao-gia"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs sm:text-sm transition-all flex-shrink-0 shadow-md shadow-[#5F8A03]/30 self-start md:self-auto"
        >
          <FolderArchive size={15} />
          <span>Tải Trọn Bộ (.ZIP)</span>
        </Link>
      </div>

      <div className="p-6 sm:p-10">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'all' | 'cad' | 'cert' | 'spec')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid of File Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const accent = CATEGORY_ACCENTS[item.category];
            const { Icon } = accent;
            const isDownloaded = downloadSuccessId === item.id;
            return (
              <div
                key={item.id}
                className={`group bg-white rounded-2xl border border-slate-200 shadow-xs ${accent.cardHover} hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col`}
              >
                {/* Top color bar */}
                <div className={`h-1.5 ${accent.bar}`} />

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Icon + Badges row */}
                  <div className="flex items-start gap-3 mb-3.5">
                    <div className={`w-11 h-11 rounded-xl ${accent.iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon size={19} />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 flex-wrap min-w-0">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border ${accent.formatBadge}`}>
                        {item.format} · {item.size}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30 whitespace-nowrap">
                        {item.ratingBadge}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug mb-1.5">
                    {item.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">QCVN 06:2022</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isDownloaded
                          ? 'bg-[#5F8A03] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-[#F26522] group-hover:text-white group-hover:shadow-sm'
                      }`}
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Đang tải…</span>
                        </>
                      ) : (
                        <>
                          <Download size={13} />
                          <span>Tải Về ({item.format})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submittal Notice Banner */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#F4F9E8] border border-[#7CB305]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <ShieldCheck size={20} className="text-[#5F8A03] flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              Quý kỹ sư cần hồ sơ đệ trình mẫu (Submittal Packet) có <strong>dấu đỏ công chứng</strong> của Remak và Viện IBST?
            </span>
          </div>
          <a
            href="tel:0902441981"
            className="text-sm font-extrabold text-[#5F8A03] hover:text-[#7CB305] hover:underline whitespace-nowrap transition-colors"
          >
            Hotline Kỹ Sư: 0902.441.981 →
          </a>
        </div>
      </div>
    </section>
  );
}
