'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Flame,
  FileCheck,
  Download,
  PhoneCall,
  Award,
  CheckCircle2
} from 'lucide-react';

const TEST_REPORTS = [
  {
    assembly: 'Hệ Bọc Ống Gió Khói Sự Cố (HVAC)',
    rating: 'EI 30 – EI 120',
    standard: 'TCVN 9311-8:2012 / QCVN 06:2022',
    thickness: 'Tấm MGO 8mm & 10mm',
    laboratory: 'Viện KHCN Xây Dựng (IBST)',
    status: 'Đã thử nghiệm thành công',
    note: 'Không nứt vỡ, mặt ngoài duy trì <140°C trong suốt thời gian đốt lò',
  },
  {
    assembly: 'Hệ Vách Ngăn Cháy Nhà Xưởng & Chung Cư',
    rating: 'EI 60 – EI 150',
    standard: 'TCVN 9311-1:2012 / ISO 834',
    thickness: 'Tấm MGO 10mm & 12mm',
    laboratory: 'Viện KHCN Xây Dựng (IBST)',
    status: 'Đã thử nghiệm thành công',
    note: 'Độ toàn vẹn E và cách nhiệt I đạt vượt thời gian thiết kế',
  },
  {
    assembly: 'Hệ Sàn Chịu Tải Ngăn Cháy Gác Lửng',
    rating: 'EI 180 (3 Giờ)',
    standard: 'ASTM E119 / BS 476',
    thickness: 'Tấm MGO 15mm & 18mm',
    laboratory: 'Phòng Thí Nghiệm Trọng Điểm Quốc Gia',
    status: 'Đã thử nghiệm thành công',
    note: 'Chịu tải trọng phân bố 850 kg/m² dưới ngọn lửa 1.150°C',
  },
  {
    assembly: 'Thử Nghiệm Tính Không Cháy Vật Liệu',
    rating: 'Euroclass A1',
    standard: 'ISO 1182:2020 / ISO 1716',
    thickness: 'Toàn bộ dải độ dày 5 - 18mm',
    laboratory: 'Quatest 1 / IBST',
    status: 'Đạt cấp A1 tuyệt đối',
    note: 'Đốt 750°C không sinh ngọn lửa, độ tăng nhiệt độ lò <15°C',
  },
  {
    assembly: 'Bọc Bảo Vệ Dầm Cột Thép Chịu Lực',
    rating: 'R30 – R180',
    standard: 'TCVN 9311-6 / TCVN 9311-7:2012',
    thickness: 'Tấm MGO 12mm & 15mm',
    laboratory: 'Cục Cảnh Sát PCCC & CNCH',
    status: 'Phương án được phê duyệt',
    note: 'Thép duy trì nhiệt độ an toàn <550°C, không sụp đổ kết cấu',
  },
];

export default function ProductFireTestProof() {
  return (
    <section className="py-16 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        
        {/* HEADING */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đốt Mẫu Thực Tế Tại Viện IBST <br className="hidden sm:block" />
            <span className="text-[#5F8A03]">Đạt Nghiệm Thu 100% Theo QCVN 06:2022</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Khác với các dòng vật liệu trôi nổi chỉ thử nghiệm lý thuyết, 
            <strong> Tấm MGO Remak® FireOFF</strong> đã vượt qua các bài đốt mẫu lò ngang và lò đứng thực tế 
            tại Viện Khoa học Công nghệ Xây dựng (IBST) dưới sự giám sát nghiêm ngặt của Cục Cảnh sát PCCC & CNCH.
          </p>
        </div>

        {/* 4 CON SỐ BẢO CHỨNG NIỀM TIN */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-[#7CB305]/50 hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03]" />
            <div className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7CB305] to-[#5F8A03] text-white flex items-center justify-center shadow-sm shadow-[#5F8A03]/25 flex-shrink-0">
                  <Flame size={22} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">1.200°C</div>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-3">Chịu Lửa Trực Tiếp</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Không bắt lửa, không biến dạng ở nhiệt độ cực hạn</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-[#F26522]/50 hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#F26522] to-[#D95314]" />
            <div className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F26522] to-[#D95314] text-white flex items-center justify-center shadow-sm shadow-[#D95314]/25 flex-shrink-0">
                  <Award size={22} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">EI 180</div>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-3">Giới Hạn Chịu Lửa Tối Đa</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Thời gian toàn vẹn và cách nhiệt lên tới 3 giờ liên tục</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-[#7CB305]/50 hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03]" />
            <div className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7CB305] to-[#5F8A03] text-white flex items-center justify-center shadow-sm shadow-[#5F8A03]/25 flex-shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">0% Clo</div>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-3">Zero-Chloride (MOS)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Không ăn mòn tôn kẽm và đinh vít, tuổi thọ trên 50 năm</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-[#F26522]/50 hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#F26522] to-[#D95314]" />
            <div className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F26522] to-[#D95314] text-white flex items-center justify-center shadow-sm shadow-[#D95314]/25 flex-shrink-0">
                  <FileCheck size={22} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-3">Hồ Sơ Nghiệm Thu</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Cung cấp bản sao công chứng và chứng chỉ xuất xưởng CO/CQ</p>
            </div>
          </div>
        </div>

        {/* BẢNG TỔNG HỢP CÁC KẾT QUẢ THỬ NGHIỆM THỰC TẾ */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg mb-10">
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
                Bảng Đối Chiếu Các Cấu Kiện Đã Đốt Thử Nghiệm Thành Công
              </h3>
            </div>
            <Link
              href="/bao-gia"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Download size={14} />
              <span>Tải Hồ Sơ Đầy Đủ (PDF)</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse" style={{ minWidth: 700 }}>
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th scope="col" className="sticky left-0 z-20 bg-slate-50 px-5 py-4 w-[220px] text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Hạng Mục Cấu Kiện
                  </th>
                  <th scope="col" className="px-5 py-4 bg-[#FEF3EC] border-l-2 border-r-2 border-[#F26522]/30 text-center w-[14%]">
                    <span className="font-extrabold text-[#F26522] text-sm whitespace-nowrap">Chỉ Số Chịu Lửa</span>
                  </th>
                  <th scope="col" className="px-5 py-4 bg-slate-50 text-left border-l border-slate-300 whitespace-nowrap">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tiêu Chuẩn Áp Dụng</span>
                  </th>
                  <th scope="col" className="px-5 py-4 bg-slate-50 text-left border-l border-slate-300 whitespace-nowrap">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Độ Dày Tấm MGO</span>
                  </th>
                  <th scope="col" className="px-5 py-4 bg-slate-50 text-left border-l border-slate-300 whitespace-nowrap">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Đơn Vị Đo Kiểm</span>
                  </th>
                  <th scope="col" className="px-5 py-4 bg-slate-50 text-left border-l border-slate-300">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Đánh Giá Thực Tế</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TEST_REPORTS.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 transition-colors duration-100">
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 align-top border-r border-b border-slate-300 transition-colors duration-100">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[13px] text-slate-900">{item.assembly}</div>
                          <div className="text-[10px] font-semibold text-[#5F8A03] mt-0.5">{item.status}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 bg-[#FEF3EC]/60 group-hover:bg-[#FEF3EC] border-l-2 border-r-2 border-b border-b-slate-300 border-[#F26522]/20 align-top text-center transition-colors duration-100 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-[#F26522] text-white font-bold text-[11px] shadow-sm">
                        {item.rating}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top border-b border-slate-300 text-[11px] font-semibold text-slate-700">
                      {item.standard}
                    </td>
                    <td className="px-5 py-4 align-top border-b border-slate-300 font-semibold text-slate-800 whitespace-nowrap">
                      {item.thickness}
                    </td>
                    <td className="px-5 py-4 align-top border-b border-slate-300 text-slate-600 whitespace-nowrap">
                      {item.laboratory}
                    </td>
                    <td className="px-5 py-4 align-top border-b border-slate-300 text-slate-600 leading-relaxed">
                      {item.note}
                    </td>
                  </tr>
                ))}

                {/* Verdict row */}
                <tr className="border-t-2 border-slate-300 bg-slate-800">
                  <td className="sticky left-0 z-10 bg-slate-800 px-5 py-4 text-xs font-black uppercase tracking-wider text-white">
                    Kết quả nghiệm thu
                  </td>
                  <td className="px-5 py-4 bg-[#F26522] text-center border-l-2 border-r-2 border-[#F26522]">
                    <div className="flex items-center justify-center gap-1.5">
                      <ShieldCheck size={16} className="text-white" />
                      <span className="font-black text-white text-sm">5/5 Đạt</span>
                    </div>
                  </td>
                  <td colSpan={4} className="px-5 py-4 text-center">
                    <span className="text-white text-sm font-medium">100% Hồ Sơ Nghiệm Thu QCVN 06:2022/BXD</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BANNER HỖ TRỢ LÀM HỒ SƠ THẦU */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-bold text-white">
              Cần Bản Sao Biên Bản Đốt Mẫu & Thuyết Minh Kỹ Thuật Đệ Trình?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kỹ sư PCCC của Remak sẵn sàng hỗ trợ nhà thầu lập bảng bóc tách, thuyết minh giải pháp 
              và cung cấp hồ sơ năng lực phục vụ giai đoạn duyệt vật tư dự án.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
            <a
              href="tel:0902441981"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall size={15} />
              <span>Hotline Kỹ Thuật: 0902.441.981</span>
            </a>
            <Link
              href="/bao-gia"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
            >
              <FileCheck size={15} />
              <span>Yêu Cầu Bộ Hồ Sơ Mẫu</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
