import StatsCounter from './StatsCounter';

export default function ProjectsHero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Main copy */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Dự Án Tiêu Biểu
            <span className="block text-[#7CB305]">Đã Triển Khai Bởi Remak® FireOFF</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Hơn 200 công trình thực tế từ nhà máy KCN, trung tâm thương mại đến data center —
            tất cả đều được nghiệm thu PCCC bởi Cục Cảnh Sát PCCC & CNCH với hồ sơ IBST đầy đủ.
          </p>
        </div>

        {/* Animated stat counters */}
        <StatsCounter />

        <p className="text-xs text-slate-500 mt-4 text-center lg:text-left">
          KCN · TTTM · Chung cư · Data center · Văn phòng — trên toàn quốc
        </p>

      </div>
    </section>
  );
}
