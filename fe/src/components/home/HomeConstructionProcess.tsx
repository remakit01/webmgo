'use client';

import React, { useState } from 'react';
import {
  Hammer,
  Scissors,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  ArrowRight,
  HardHat,
  AlertCircle,
  Sparkles,
  PhoneCall,
  Download,
} from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

interface AssemblyGuide {
  id: string;
  name: string;
  eiLevel: string;
  thickness: string;
  steps: {
    step: string;
    title: string;
    desc: string;
    proTip: string;
  }[];
  specNotes: {
    screwDistance: string;
    jointGap: string;
    sealant: string;
    framing: string;
  };
}

const ASSEMBLIES: AssemblyGuide[] = [
  {
    id: 'duct',
    name: 'Bọc Ống Gió PCCC',
    eiLevel: 'EI 30 – EI 120',
    thickness: 'Tấm 5mm – 12mm',
    steps: [
      {
        step: '01',
        title: 'Đo đạc & Cắt tấm chuẩn kích thước',
        desc: 'Đo kích thước 4 mặt ống gió tôn thực tế. Dùng dao trổ kỹ thuật (tấm 5–8mm) hoặc máy cưa đĩa gắn lưỡi cắt đá/hợp kim (tấm 10–12mm). Vết cắt phẳng mịn, không vỡ mép.',
        proTip: 'Cắt mép thẳng góc 90° để khi ghép hộp không bị hở khe nhiệt.',
      },
      {
        step: '02',
        title: 'Bọc bông khoáng & Lắp tấm MGO',
        desc: 'Trải lớp bông khoáng Rockwool Remak® ôm sát thân ống. Áp tấm MGO lên mặt ngoài, định vị vuông vắn bằng kẹp góc chuyên dụng trước khi bắn vít.',
        proTip: 'Đảm bảo bông khoáng không bị dồn cục hoặc xẹp lún ở các góc cong.',
      },
      {
        step: '03',
        title: 'Bắn vít tự khoan mạ chống rỉ & Đai kẽm',
        desc: 'Bắn vít tự khoan mạ kẽm đầu dù cách mép tấm ≥ 15mm, bước vít 150mm. Lắp đai tôn mạ kẽm gia cường chu vi ống mỗi khoảng cách 400 – 500mm.',
        proTip: 'Không dùng vít đen thạch cao thường; bắt buộc dùng vít mạ kẽm hoặc inox.',
      },
      {
        step: '04',
        title: 'Trám keo Remak® FireSeal & Lưới thủy tinh',
        desc: 'Bơm keo chống cháy trương nở Remak® FireSeal lấp kín toàn bộ góc nối và đầu vít. Dán băng keo lưới thủy tinh Remak 50mm chống nứt mối ghép khi chịu áp lực gió.',
        proTip: 'Kiểm tra độ kín khít bằng thước lá ≤ 0.5mm trước khi nghiệm thu PCCC.',
      },
    ],
    specNotes: {
      screwDistance: '150mm dọc cạnh / cách mép ≥ 15mm',
      jointGap: 'Khe hở mép 2 – 3mm (trám kín keo FireSeal)',
      sealant: 'Keo trương nở Remak® FireSeal EI 120',
      framing: 'Khung đai tôn mạ kẽm bước 400 – 500mm',
    },
  },
  {
    id: 'wall',
    name: 'Vách Ngăn Chống Cháy',
    eiLevel: 'EI 60 – EI 150',
    thickness: 'Tấm 10mm – 12mm',
    steps: [
      {
        step: '01',
        title: 'Định vị tim vách & Dựng hệ khung thép',
        desc: 'Bắn tắc kê nở cố định thanh U sàn và trần mỗi 600mm. Lắp cột đứng thanh C bước 400mm (chuẩn EI 120) hoặc 600mm (chuẩn EI 60), kiểm tra thẳng đứng bằng nivo.',
        proTip: 'Đệm băng keo xốp cách âm dưới chân thanh U để triệt tiêu cầu âm thanh.',
      },
      {
        step: '02',
        title: 'Lắp tấm MGO mặt thứ nhất & Điền bông',
        desc: 'Đặt tấm MGO theo phương đứng, chừa chân tấm cách sàn bê tông 10mm. Chèn bông khoáng Rockwool tỷ trọng 40–60 kg/m³ vào toàn bộ khoang rỗng giữa 2 hàng khung.',
        proTip: 'Chân tấm cách sàn 10mm để chống thấm mao dẫn từ sàn ẩm ướt.',
      },
      {
        step: '03',
        title: 'Ốp tấm MGO mặt thứ hai (So le mối nối)',
        desc: 'Lắp tấm MGO mặt đối diện theo nguyên tắc so le mối nối (offset tối thiểu 600mm so với mặt trước) nhằm triệt tiêu hoàn toàn đường truyền nhiệt xuyên thẳng qua vách.',
        proTip: 'Khoảng cách so le mối nối 2 mặt tối thiểu 600mm là điều kiện bắt buộc của PCCC.',
      },
      {
        step: '04',
        title: 'Bả xử lý mối nối phẳng mịn & Sơn hoàn thiện',
        desc: 'Dán băng lưới sợi thủy tinh Remak® Mesh, trét bột bả xử lý mối nối chống cháy, xả nhám sau 24h. Bề mặt tấm MGO trắng mịn nhận sơn nước trực tiếp không cần sơn lót.',
        proTip: 'Bề mặt phẳng nhẵn tiêu chuẩn Level 4 sẵn sàng cho sơn trang trí cao cấp.',
      },
    ],
    specNotes: {
      screwDistance: '200mm ở giữa tấm / 150mm ở mép viền',
      jointGap: '3mm giữa hai tấm / 10mm cách sàn',
      sealant: 'Bột bả chống cháy Remak® JointCompound',
      framing: 'Hệ khung kẽm C75/U76 hoặc C100/U102',
    },
  },
  {
    id: 'floor',
    name: 'Sàn Kỹ Thuật & Gác Lửng',
    eiLevel: 'REI 60 – REI 120',
    thickness: 'Tấm 15mm – 18mm',
    steps: [
      {
        step: '01',
        title: 'Gia công hệ đà sắt chịu tải trọng',
        desc: 'Hàn dựng hệ khung dầm thép hộp (dầm chính I hoặc hộp lớn, dầm phụ bước 407 x 407mm hoặc 407 x 610mm phù hợp với khổ tấm 1.22 x 2.44m).',
        proTip: 'Mép tấm MGO luôn luôn phải gác tối thiểu 25mm lên bản cánh dầm thép.',
      },
      {
        step: '02',
        title: 'Xếp tấm so le sole gạch & Chừa khe co giãn',
        desc: 'Xếp tấm sole dạng mạch gạch chữ công. Luôn chừa khe hở 3–5mm giữa các mép tấm để bù trừ nhiệt độ giãn nở của kết cấu nhà thép.',
        proTip: 'Không xếp 4 góc tấm tụ lại 1 điểm; xếp so le so với hàng trước 1.22m.',
      },
      {
        step: '03',
        title: 'Bắn vít tự khoan cánh có ngạnh âm đầu',
        desc: 'Sử dụng vít tự khoan có đuôi cá và cánh tự khoét gỗ để đầu vít chìm phẳng bằng mặt tấm MGO. Bắn vít mỗi 200mm dọc khung đỡ và 150mm ở các mép biên.',
        proTip: 'Dùng máy vặn vít có chỉnh lực siết để tránh làm vỡ âm quá sâu mặt tấm.',
      },
      {
        step: '04',
        title: 'Bơm keo trám khe PU & Lát sàn hoàn thiện',
        desc: 'Trám đầy keo PU hoặc keo chống cháy vào khe nối. Bề mặt tấm MGO chịu tải > 850 kg/m², sẵn sàng lát sàn gỗ công nghiệp, trải thảm, dán vinyl hoặc sơn epoxy chịu mài mòn.',
        proTip: 'Nếu dán gạch men, quét 1 lớp chống thấm tạo nhám kết dính trước khi dán keo gạch.',
      },
    ],
    specNotes: {
      screwDistance: '200mm dọc đà / 150mm ở 4 góc mép',
      jointGap: 'Chừa khe 3 – 5mm giữa các tấm',
      sealant: 'Keo đàn hồi Polyurethane (PU) trám khe',
      framing: 'Ô lưới thép hộp tối đa 407 × 407mm hoặc 407 × 610mm',
    },
  },
];

interface HomeConstructionProcessProps {
  onOpenQuoteModal?: (context?: { application?: string; note?: string }) => void;
}

export default function HomeConstructionProcess({ onOpenQuoteModal }: HomeConstructionProcessProps) {
  const [activeTab, setActiveTab] = useState<string>('duct');

  const currentAssembly = ASSEMBLIES.find((a) => a.id === activeTab) || ASSEMBLIES[0];

  const handleOpenQuote = (appNote: string) => {
    if (onOpenQuoteModal) {
      onOpenQuoteModal({
        application: currentAssembly.name,
        note: `Yêu cầu tư vấn kỹ thuật & báo giá: Hệ ${appNote}`,
      });
    } else {
      const el = document.getElementById('form-bao-gia-chuyen-sau');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="huong-dan-thi-cong"
      aria-label="Quy trình thi công tấm chống cháy MGO Remak"
      className="max-w-[1440px] mx-auto px-4 lg:px-8 font-sans scroll-mt-24"
    >
      <SectionHeading
        title="Thi Công Ra Sao? Quy Trình 4 Bước Chuẩn Thợ"
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* ── 1. THANH CHỌN HỆ GIẢI PHÁP THI CÔNG (TABS) ── */}
        <div className="bg-slate-900 p-4 sm:p-6 text-white border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7CB305] flex items-center gap-1.5 mb-1">
                <HardHat size={14} />
                Cẩm Nang Kỹ Thuật Độc Quyền
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Chọn Giải Pháp Bạn Đang Quan Tâm Để Xem Quy Trình
              </h3>
            </div>

            {/* 3 Tabs lớn */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Các hệ thi công MGO">
              {ASSEMBLIES.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    id={`tab-${item.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white shadow-lg shadow-orange-600/30'
                        : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/25 text-white/90">
                      {item.eiLevel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2. NỘI DUNG 4 BƯỚC THI CÔNG CHI TIẾT ── */}
        <div
          role="tabpanel"
          id={`panel-${currentAssembly.id}`}
          aria-labelledby={`tab-${currentAssembly.id}`}
          className="p-6 sm:p-10 space-y-10"
        >
          {/* Header giải pháp đang chọn */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#F4F9E8] text-[#5F8A03] border border-[#5F8A03]/20">
                  {currentAssembly.eiLevel}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Độ dày khuyến nghị: <strong className="text-slate-800">{currentAssembly.thickness}</strong>
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                Quy Trình Thi Công {currentAssembly.name} Đạt Chuẩn Nghiệm Thu PCCC
              </h4>
            </div>

            <button
              type="button"
              onClick={() => handleOpenQuote(`${currentAssembly.name} (${currentAssembly.eiLevel})`)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#4D7002] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Sparkles size={16} />
              <span>Nhận Báo Giá Hệ {currentAssembly.name}</span>
            </button>
          </div>

          {/* Lưới 4 bước thi công dạng Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentAssembly.steps.map((st, sIdx) => (
              <div
                key={sIdx}
                className="relative bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-[#7CB305]/60 hover:bg-[#F4F9E8]/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-[#5F8A03] opacity-80 group-hover:opacity-100 transition-opacity">
                      {st.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      Bước {sIdx + 1}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {st.title}
                  </h5>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {st.desc}
                  </p>
                </div>

                {/* Mẹo thợ lành nghề (ProTip) */}
                <div className="pt-3 border-t border-slate-200/80 mt-auto bg-white/70 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-700">
                    <AlertCircle size={13} className="text-[#F26522] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Lưu ý thợ:</strong> {st.proTip}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── 3. BẢNG TIÊU CHUẨN THI CÔNG ĐỒNG BỘ ── */}
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Wrench size={15} className="text-[#5F8A03]" />
              Quy Cách Kỹ Thuật Bắt Buộc Khi Lắp Đặt
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Khoảng cách vít:</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {currentAssembly.specNotes.screwDistance}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Khe co giãn giữa 2 tấm:</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {currentAssembly.specNotes.jointGap}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Keo trám xử lý mối nối:</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {currentAssembly.specNotes.sealant}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Quy cách hệ khung đỡ:</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {currentAssembly.specNotes.framing}
                </span>
              </div>
            </div>
          </div>

          {/* ── 4. KHỐI CAM KẾT ĐỒNG HÀNH & CTA CHỐT HẠ ── */}
          <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7CB305]/20 text-[#7CB305] text-xs font-bold">
                  <ShieldCheck size={14} />
                  <span>Đảm Bảo 100% Nghiệm Thu PCCC Thực Tế</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  Bạn Cần Bản Vẽ CAD Chi Tiết & Hỗ Trợ Kỹ Sư Tại Công Trường?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Remak cung cấp trọn bộ file CAD (.dwg) các mặt cắt bọc ống gió, vách ngăn và sàn chịu lực. Đội ngũ kỹ sư PCCC của Remak sẵn sàng có mặt tại công trình hướng dẫn tổ đội thợ thi công đúng quy chuẩn đốt lò mẫu.
                </p>
              </div>

              {/* Nhóm nút CTA */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[280px]">
                <button
                  type="button"
                  onClick={() => handleOpenQuote('Tải CAD & Báo Giá')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <FileDown size={16} />
                  <span>Gửi Bản Vẽ Nhận Bóc Tách Kỹ Thuật</span>
                </button>

                <a
                  href="tel:0902441981"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <PhoneCall size={15} className="text-[#7CB305]" />
                  <span>Hotline Kỹ Sư: 0902.441.981</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
