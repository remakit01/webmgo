'use client';

import React, { useState } from 'react';
import { 
  FileCode2, 
  Download, 
  FileCheck2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  FolderArchive,
  Sparkles
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

export default function ApplicationCadDownload({
  filterCategory,
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
    // Có thể mở popup hoặc trigger tải file
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 my-10 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Bản Vẽ CAD (.DWG) & Hồ Sơ Đốt Lò IBST
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            File CAD mặt cắt cấu tạo cho kiến trúc sư và hồ sơ nghiệm thu thực tế cho nhà thầu PCCC
          </p>
        </div>

        <a
          href="/bao-gia"
          className="px-4 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 self-start md:self-auto shadow-xs"
        >
          <FolderArchive size={14} />
          <span>Tải Trọn Bộ (.ZIP)</span>
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-5 pb-3">
        {[
          { id: 'all', label: 'Tất Cả (8)' },
          { id: 'cad', label: 'Bản Vẽ CAD (.DWG)' },
          { id: 'cert', label: 'Chứng Thư IBST' },
          { id: 'spec', label: 'Checklist TVGS' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {filteredItems.map((item) => {
          const isDownloaded = downloadSuccessId === item.id;
          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-[#7CB305] hover:shadow-xs transition-all bg-white flex flex-col justify-between group"
            >
              <div>
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                    item.format === 'DWG' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {item.format} • {item.size}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30">
                    {item.ratingBadge}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Cập nhật QCVN 06:2022
                </span>

                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDownloaded
                      ? 'bg-[#5F8A03] text-white'
                      : 'bg-slate-100 group-hover:bg-[#F26522] text-slate-700 group-hover:text-white'
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Đang Tải Xuống...</span>
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
          );
        })}
      </div>

      {/* Submittal Notice Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-[#F4F9E8] border border-[#7CB305]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800">
          <ShieldCheck size={18} className="text-[#5F8A03] flex-shrink-0" />
          <span>
            Quý kỹ sư cần hồ sơ đệ trình mẫu (Submittal Packet) có <strong>dấu đỏ công chứng</strong> của Remak và Viện IBST?
          </span>
        </div>
        <a
          href="tel:0902441981"
          className="font-extrabold text-[#5F8A03] hover:underline whitespace-nowrap"
        >
          Hotline Kỹ Sư: 0902.441.981 →
        </a>
      </div>

    </section>
  );
}
