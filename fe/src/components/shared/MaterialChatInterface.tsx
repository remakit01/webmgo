'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/LocaleLink';
import { calculateMgoMaterials, CalculationResult } from '@/lib/calculator';
import { formatNumber } from '@/lib/utils';

export interface MaterialChatInterfaceProps {
  onClose?: () => void;
  isPopupMode?: boolean;
  onExpandPopup?: () => void;
}

interface ApplicationOption {
  id: string;
  label: string;
  sub: string;
  defaultThickness: number;
}

const APPLICATIONS: ApplicationOption[] = [
  {
    id: 'duct',
    label: 'Bọc Ống Gió PCCC',
    sub: 'Tiêu chuẩn EI 30 đến EI 120',
    defaultThickness: 8,
  },
  {
    id: 'wall',
    label: 'Vách Ngăn Chống Cháy',
    sub: 'Cách âm & Chịu lửa EI 60 đến EI 120',
    defaultThickness: 10,
  },
  {
    id: 'floor',
    label: 'Lót Sàn Chịu Lực',
    sub: 'Sàn gác lửng, chịu tải trên 500kg/m²',
    defaultThickness: 18,
  },
  {
    id: 'door',
    label: 'Lõi Cửa Chống Cháy',
    sub: 'Cửa thép, cửa ngăn cháy chung cư',
    defaultThickness: 5,
  },
];

const PRESET_AREAS = [30, 50, 100, 200, 300];
const THICKNESS_OPTIONS = [5, 8, 10, 12, 15, 18];

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function MaterialChatInterface({
  onClose,
  isPopupMode = false,
  onExpandPopup,
}: MaterialChatInterfaceProps) {
  // State bóc tách theo luồng hội thoại liên tục
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationOption | null>(null);
  const [area, setArea] = useState<number>(50);
  const [customAreaInput, setCustomAreaInput] = useState<string>('');
  const [selectedThickness, setSelectedThickness] = useState<number>(10);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // State ô chat tự do và danh sách tin nhắn hội thoại
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom();
  }, [step, isTyping, result, selectedThickness, chatMessages]);

  const handleSelectApp = (app: ApplicationOption) => {
    setSelectedApp(app);
    setSelectedThickness(app.defaultThickness);
    setIsTyping(true);
    setStep(2);
    setTimeout(() => {
      setIsTyping(false);
    }, 350);
  };

  const handleSelectArea = (val: number) => {
    setArea(val);
    triggerCalculation(val, selectedThickness);
  };

  const handleCustomAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customAreaInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(2000, Math.max(5, parsed));
      setArea(clamped);
      triggerCalculation(clamped, selectedThickness);
      setCustomAreaInput('');
    }
  };

  const triggerCalculation = (chosenArea: number, chosenThickness: number) => {
    setIsTyping(true);
    setStep(3);
    setTimeout(() => {
      const res = calculateMgoMaterials(chosenArea, chosenThickness);
      setResult(res);
      setIsTyping(false);
    }, 400);
  };

  const handleChangeThickness = (th: number) => {
    setSelectedThickness(th);
    const res = calculateMgoMaterials(area, th);
    setResult(res);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: String(Date.now()), sender: 'user', text: query };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const qLower = query.toLowerCase();
      let replyText = '';

      const areaMatch = query.match(/(\d+)\s*(m2|m²|mét vuông|met vuong)/i) || query.match(/(\d+)\s*(m)$/i);
      if (areaMatch) {
        const parsedArea = Math.min(2000, Math.max(5, parseInt(areaMatch[1], 10)));
        setArea(parsedArea);
        triggerCalculation(parsedArea, selectedThickness);
        replyText = `Kỹ sư Remak đã nhận diện diện tích ${parsedArea} m² và cập nhật bảng bóc tách khối lượng ở trên cho Quý khách.`;
      } else if (qLower.includes('giá') || qLower.includes('chi phí') || qLower.includes('bao nhiêu')) {
        replyText = 'Tấm MGO Remak có đơn giá từ 125.000đ/tấm (5mm) đến 480.000đ/tấm (18mm) tùy thuộc vào số lượng và độ dày. Quý khách có thể nhấn "Mở Trang Báo Giá Chi Tiết" hoặc liên hệ Hotline: 0902.441.981 để nhận chiết khấu dự án tốt nhất.';
      } else if (qLower.includes('độ dày') || qLower.includes('dày') || qLower.includes('quy chuẩn') || qLower.includes('pccc') || qLower.includes('ei')) {
        replyText = 'Theo tiêu chuẩn QCVN 06:2022/BXD: bọc ống gió PCCC thường dùng tấm 8mm (EI 60), vách ngăn chống cháy thường dùng tấm 10mm hoặc 12mm (EI 60 - EI 120), lót sàn chịu lực dùng 18mm. Tất cả đều đạt kiểm định thử nghiệm đốt lò tại Viện IBST.';
      } else if (qLower.includes('rỉ') || qLower.includes('sét') || qLower.includes('ẩm') || qLower.includes('nước') || qLower.includes('mốc')) {
        replyText = 'Tấm MGO Remak ứng dụng công nghệ Zero-Rust khử triệt để ion Clo, kháng nước 100%, không rỉ sét ốc vít và chống ẩm mốc vĩnh viễn trong mọi điều kiện công trình.';
      } else if (qLower.includes('giao hàng') || qLower.includes('kho') || qLower.includes('vận chuyển') || qLower.includes('ở đâu')) {
        replyText = 'Remak có tổng kho sẵn hàng số lượng lớn tại Hà Nội và TP.HCM, hỗ trợ giao hàng hỏa tốc trong 24 giờ đến tận chân công trình trên toàn quốc kèm chứng chỉ xuất xưởng (CO/CQ).';
      } else if (qLower.includes('hotline') || qLower.includes('liên hệ') || qLower.includes('sđt') || qLower.includes('kỹ sư')) {
        replyText = 'Kỹ sư chuyên trách Remak sẵn sàng hỗ trợ trực tiếp 24/7 qua Hotline: 0902.441.981. Quý khách cũng có thể gửi bản vẽ để chúng tôi bóc tách chi tiết.';
      } else {
        replyText = `Kỹ sư Remak đã ghi nhận câu hỏi: "${query}". Chuyên viên kỹ thuật sẽ tư vấn chi tiết cho Quý khách qua Hotline 0902.441.981 hoặc Quý khách có thể chọn hạng mục thi công ở trên để tính toán ngay nhé!`;
      }

      const botMsg: ChatMessage = { id: String(Date.now() + 1), sender: 'bot', text: replyText };
      setChatMessages((prev) => [...prev, botMsg]);
    }, 350);
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 text-white w-full overflow-hidden ${isPopupMode
          ? 'h-full'
          : 'h-[620px] max-h-[85vh] rounded-2xl border border-slate-700/80 shadow-2xl'
        }`}
    >
      {/* 1. CHAT HEADER (KHÔNG DÙNG ICON, CHỈ DÙNG TYPOGRAPHY VÀ BADGE) */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
        <div className="min-w-0 pr-3">
          <h3 className="text-sm font-bold text-white truncate">
            Kỹ Sư Tư Vấn Remak®
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            ✕ Đóng
          </button>
        )}
      </div>

      {/* 2. CHAT CONTENT SCROLL AREA (LIÊN TỤC, KHÔNG CÓ TAB BỊ ĐÈ HAY PHỨC TẠP) */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs sm:text-sm"
      >
        {/* BOT MESSAGE 1: LỜI CHÀO & CHỌN HẠNG MỤC */}
        <div className="space-y-2.5 max-w-[95%]">
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs border border-slate-800 leading-relaxed shadow-sm">
            <span className="text-[10px] font-black text-[#7CB305] block uppercase tracking-wider mb-1">
              KỸ SƯ REMAK
            </span>
            Chào Quý khách! Tôi là kỹ sư chuyên môn Remak. Quý khách vui lòng chọn hạng mục thi công để nhận dự toán vật tư hoặc nhập câu hỏi trực tiếp ở thanh chat bên dưới:
          </div>

          {step === 1 && !selectedApp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {APPLICATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectApp(item)}
                  className="p-3 text-left rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-[#F4F9E8]/10 hover:border-[#7CB305] text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  <div className="font-bold text-xs text-white mb-0.5">{item.label}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{item.sub}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* USER RESPONSE 1: HẠNG MỤC ĐÃ CHỌN */}
        {selectedApp && (
          <div className="flex justify-end">
            <div className="bg-[#5F8A03] text-white px-3.5 py-2 rounded-2xl rounded-tr-xs font-semibold text-xs sm:text-sm">
              Hạng mục: {selectedApp.label}
            </div>
          </div>
        )}

        {/* BOT MESSAGE 2: HỎI DIỆN TÍCH */}
        {selectedApp && (
          <div className="space-y-2.5 max-w-[95%]">
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs border border-slate-800 leading-relaxed shadow-sm">
              <span className="text-[10px] font-black text-[#7CB305] block uppercase tracking-wider mb-1">
                KỸ SƯ REMAK
              </span>
              Với hạng mục <strong>{selectedApp.label}</strong>, diện tích công trình của Quý khách khoảng <strong>bao nhiêu m²</strong>?
            </div>

            {step === 2 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AREAS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectArea(val)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 hover:bg-[#5F8A03] hover:border-[#5F8A03] text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      {val} m²
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleCustomAreaSubmit}
                  className="flex items-center gap-2 max-w-sm pt-0.5"
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Hoặc gõ diện tích khác (m²)..."
                    value={customAreaInput}
                    onChange={(e) => setCustomAreaInput(e.target.value)}
                    min={5}
                    max={2000}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7CB305]"
                  />
                  <button
                    type="submit"
                    disabled={!customAreaInput}
                    className="px-3.5 py-2 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
                  >
                    Bóc tách
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* USER RESPONSE 2: DIỆN TÍCH */}
        {step === 3 && (
          <div className="flex justify-end">
            <div className="bg-[#5F8A03] text-white px-3.5 py-2 rounded-2xl rounded-tr-xs font-semibold text-xs sm:text-sm">
              Diện tích: {area} m²
            </div>
          </div>
        )}

        {/* TYPING INDICATOR */}
        {isTyping && (
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-xs max-w-xs text-xs text-slate-400 font-medium">
            Đang tính toán theo QCVN 06:2022/BXD...
          </div>
        )}

        {/* BOT MESSAGE 3: KẾT QUẢ BÓC TÁCH DỰ TOÁN */}
        {!isTyping && step === 3 && result && (
          <div className="space-y-3 w-full">
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs border border-slate-800 leading-relaxed shadow-sm">
              <span className="text-[10px] font-black text-[#7CB305] block uppercase tracking-wider mb-1">
                KỸ SƯ REMAK
              </span>
              Dựa trên diện tích <strong>{area} m²</strong> và tiêu chuẩn PCCC, Remak đề xuất độ dày tối ưu là <strong className="text-[#7CB305]">{selectedThickness}mm</strong>. Dưới đây là bảng khối lượng chi tiết:
            </div>

            {/* BẢNG KẾT QUẢ GỌN GÀNG, KHÔNG DÙNG ICON */}
            <div className="bg-slate-900/95 p-4 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  BẢNG BÓC TÁCH VẬT TƯ ({area} m²)
                </span>
                <span className="text-[11px] text-slate-400">Gồm 5% hao hụt</span>
              </div>

              {/* CHỌN ĐỘ DÀY THỬ NGHIỆM */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">
                  Chọn độ dày tấm MGO:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {THICKNESS_OPTIONS.map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => handleChangeThickness(th)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${selectedThickness === th
                          ? 'bg-[#F26522] text-white border-[#F26522]'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                      {th}mm
                    </button>
                  ))}
                </div>
              </div>

              {/* THÔNG SỐ CHI TIẾT */}
              <div className="divide-y divide-slate-800 text-xs">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-300">
                    Tấm MGO ({selectedThickness}mm, 1.22×2.44m):
                  </span>
                  <span className="font-bold text-[#7CB305] text-sm">{result.sheets} tấm</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-300">Khung xương thép mạ kẽm:</span>
                  <span className="font-bold text-white">{result.frames} cây</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-300">Vít tự khoan mạ chống rỉ:</span>
                  <span className="font-bold text-white">{result.screws} con</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-300">Keo nở ngăn khói chống cháy:</span>
                  <span className="font-bold text-white">{result.sealantTubes} tuýp</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-300">Tổng khối lượng ước tính:</span>
                  <span className="font-bold text-slate-300">~{result.estWeightKg} kg</span>
                </div>
              </div>

              {/* TỔNG KINH PHÍ */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-end justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Tổng kinh phí vật tư ước tính:
                  </div>
                  <div className="text-lg sm:text-xl font-black text-[#7CB305] mt-0.5">
                    ~ {formatNumber(result.estimatedCost)} đ
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 italic">
                  (Chưa gồm VAT & cước xe)
                </span>
              </div>

              {/* HÀNH ĐỘNG DẪN TRANG */}
              <div className="space-y-2 pt-1">
                <Link
                  href={`/bao-gia?app=${selectedApp?.id}&area=${area}&thickness=${selectedThickness}`}
                  className="block w-full text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md"
                >
                  Mở Trang Báo Giá Chi Tiết
                </Link>

                <a
                  href="tel:0902441981"
                  className="block w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs text-center transition-colors"
                >
                  Hotline Kỹ Sư: 0902.441.981
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TIN NHẮN TỪ Ô CHAT TỰ DO */}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'items-start max-w-[95%]'}`}
          >
            {msg.sender === 'user' ? (
              <div className="bg-[#5F8A03] text-white px-3.5 py-2 rounded-2xl rounded-tr-xs font-semibold text-xs sm:text-sm">
                {msg.text}
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs border border-slate-800 leading-relaxed shadow-sm">
                <span className="text-[10px] font-black text-[#7CB305] block uppercase tracking-wider mb-1">
                  KỸ SƯ REMAK
                </span>
                {msg.text}
              </div>
            )}
          </div>
        ))}

      </div>

      {/* 3. Ô NHẬP CHAT TRỰC TIẾP (THUẦN TEXT - KHÔNG ICON) */}
      <div className="bg-slate-950 border-t border-slate-800 p-2.5 sm:p-3 shrink-0 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-500 font-medium shrink-0">Gợi ý:</span>
          {[
            'Báo giá tấm 8mm',
            'Ống gió dùng loại nào?',
            'Có rỉ sét ốc vít không?',
            'Cần 120m2 vách',
            'Hotline kỹ sư',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => setChatInput(promptText)}
              className="px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {promptText}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Nhập câu hỏi kỹ thuật hoặc diện tích..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7CB305]"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#4D7002] text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
