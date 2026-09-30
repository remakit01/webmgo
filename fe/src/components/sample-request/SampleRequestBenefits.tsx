import { ShieldCheck, FileCheck2, Truck } from 'lucide-react';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Không rủi ro',
    desc: 'Nhận mẫu thực tế → kiểm tra tại công trình → mới quyết định đặt hàng. Không cam kết, không ràng buộc.',
    color: 'text-[#F26522]',
    bg: 'bg-[#F26522]/10',
  },
  {
    icon: FileCheck2,
    title: 'Kỹ thuật đầy đủ',
    desc: 'Kèm TDS thông số kỹ thuật và biên bản thử nghiệm đốt lò IBST được công chứng — đủ hồ sơ đệ trình vật tư.',
    color: 'text-[#5F8A03]',
    bg: 'bg-[#F4F9E8]',
  },
  {
    icon: Truck,
    title: 'Giao nhanh toàn quốc',
    desc: 'Giao trong 3 ngày làm việc đến 63 tỉnh thành, không tính phí vận chuyển cho mẫu thử.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
];

export default function SampleRequestBenefits() {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BENEFITS.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={17} className={color} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-0.5">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
