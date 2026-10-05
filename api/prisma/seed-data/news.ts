// Dữ liệu Tin tức ban đầu (chép từ fe/src/data/news.ts trước khi chuyển sang CMS) — chỉ dùng cho prisma/seed.ts.
// Sau khi seed, nội dung được quản lý trong CMS; không thêm bài mới vào file này.

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  categoryColor: string;
  date: string;
  readTime: string;
  desc: string;
  image: string;
  author: string;
  isHero?: boolean;
  content: string[];
  tags: string[];
}

export const NEWS_CATEGORIES = [
  { id: 'all', label: 'Tất Cả Bài Viết' },
  { id: 'tieu-chuan-pccc', label: 'Tiêu Chuẩn QCVN 06' },
  { id: 'ky-thuat', label: 'Kỹ Thuật Vật Liệu' },
  { id: 'thu-nghiem', label: 'Thử Nghiệm Thực Tế' },
  { id: 'huong-dan', label: 'Hướng Dẫn Thi Công' },
  { id: 'nghiem-thu', label: 'Kinh Nghiệm Nghiệm Thu' },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'quy-chuan-qcvn-06-2022-ong-gio-vach-ngan',
    slug: 'quy-chuan-qcvn-06-2022-ong-gio-vach-ngan',
    title: 'Quy Chuẩn QCVN 06:2022/BXD: Tiêu Chí Nghiệm Thu Ống Gió & Vách Ngăn Chống Cháy',
    category: 'Tiêu Chuẩn PCCC',
    categorySlug: 'tieu-chuan-pccc',
    categoryColor: 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/30',
    date: '15/09/2026',
    readTime: '5 phút đọc',
    desc: 'Phân tích chi tiết quy trình thử nghiệm đốt mẫu thực tế, giới hạn chịu lửa EI30 – EI120 và điều kiện nghiệm thu tại công trình theo quy định mới nhất của Cục Cảnh sát PCCC & CNCH. Bài viết tổng hợp các tiêu chí cốt lõi về hồ sơ kiểm định, phương pháp lấy mẫu hiện trường và giải pháp kỹ thuật bọc bảo vệ ống gió hút khói, vách ngăn chống cháy bằng tấm MGO Remak FireOFF nhằm đảm bảo công trình vượt qua các đợt kiểm tra nghiệm thu an toàn, đúng tiến độ và tối ưu chi phí đầu tư.',
    image: '/images/mgo-duct.jpg',
    author: 'Kỹ Sư Remak PCCC',
    isHero: true,
    tags: ['QCVN 06:2022/BXD', 'Ống gió PCCC', 'Vách ngăn chống cháy', 'Nghiệm thu PCCC'],
    content: [
      'Quy chuẩn kỹ thuật quốc gia QCVN 06:2022/BXD về An toàn cháy cho nhà và công trình đặt ra các yêu cầu khắt khe đối với vật liệu bọc bảo vệ ống gió hút khói, ống tăng áp và vách ngăn phân chia khoang cháy.',
      'Theo quy chuẩn, hệ thống ống gió chịu lửa phải được thử nghiệm theo tiêu chuẩn ISO 6944 hoặc TCVN tương đương, đạt các giới hạn EI 30, EI 60, EI 90 hoặc EI 120 tùy theo vị trí lắp đặt xuyên khoang cháy.',
      'Tấm Magie Oxit (MGO) Remak® FireOFF với thành phần khoáng tự nhiên, kết cấu gia cường lưới sợi thủy tinh kép và nồng độ ion Chloride tự do triệt tiêu, là giải pháp hàng đầu được các viện thử nghiệm như IBST và cơ quan PCCC phê duyệt cấp chứng nhận kiểm định mẫu thực tế.',
      'Khi triển khai thi công, nhà thầu cần lưu ý các giáp mí nối tấm, khoảng cách bắn vít tự khoan 15cm và quét keo chống cháy Remak® FireSeal chuyên dụng để bảo đảm tính toàn vẹn E và cách nhiệt I khi xảy ra hỏa hoạn.'
    ]
  },
  {
    id: 'cong-nghe-zero-rust-khong-an-mon-kim-loai',
    slug: 'cong-nghe-zero-rust-khong-an-mon-kim-loai',
    title: 'Công Nghệ Zero Rust: Vì Sao MGO Remak Không Gây Rỉ Sét Tôn Mạ Kẽm?',
    category: 'Kỹ Thuật Vật Liệu',
    categorySlug: 'ky-thuat',
    categoryColor: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30',
    date: '08/09/2026',
    readTime: '4 phút đọc',
    desc: 'Làm rõ cơ chế kiểm soát ion Chloride (Cl-) tự do, triệt tiêu hiện tượng ăn mòn hóa học và bảo vệ kết cấu tôn kẽm ống gió vĩnh viễn không bị rỉ sét mục rỗng. Khám phá công nghệ sản xuất MGO Magie Sulfate tiên tiến giúp công trình đạt chuẩn bền vững trên 30 năm, loại bỏ hoàn toàn nguy cơ đọng sương muối và hiện tượng chảy mồ hôi ăn mòn khung thép phụ trợ. Báo cáo phân tích chuyên sâu từ Viện Quatest 1 chứng minh độ tinh khiết vật liệu và tính năng bảo vệ vượt trội cho tôn mạ kẽm Z80 - Z275.',
    image: '/images/mgo-board.jpg',
    author: 'Phòng R&D Remak',
    tags: ['Zero Rust', 'Công nghệ Sulfate', 'Chống ăn mòn tôn kẽm', 'Magie Oxit'],
    content: [
      'Nhiều loại tấm MGO trôi nổi trên thị trường sử dụng công thức Magie Clorua (MgCl2) kém chất lượng, sau một thời gian gặp độ ẩm không khí sẽ giải phóng ion Cl- tự do gây hiện tượng "chảy mồ hôi" và ăn mòn rỉ sét bề mặt tôn kẽm của ống gió.',
      'Remak ứng dụng quy trình sản xuất tiên tiến với công thức Magie Sulfate (MgSO4) cao cấp kết hợp phụ gia trung hòa tinh khiết. Kết quả kiểm nghiệm tại Quatest 1 cho thấy hàm lượng ion Cl- hòa tan tự do < 0.05%, triệt tiêu hoàn toàn nguy cơ ăn mòn kim loại.',
      'Nhờ công nghệ Zero Rust, tấm Remak® FireOFF bảo vệ an toàn cho kết cấu tôn mạ kẽm Z80 - Z275 của ống gió trong suốt vòng đời dự án hơn 30 năm.'
    ]
  },
  {
    id: 'ket-qua-dot-thu-nghiem-vach-ei-120-ibst',
    slug: 'ket-qua-dot-thu-nghiem-vach-ei-120-ibst',
    title: 'Kết Quả Đốt Thử Nghiệm Thực Tế Hệ Vách MGO Đạt Chuẩn EI 120 Tại Viện IBST',
    category: 'Thử Nghiệm Thực Tế',
    categorySlug: 'thu-nghiem',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    date: '28/08/2026',
    readTime: '6 phút đọc',
    desc: 'Toàn cảnh buổi thử nghiệm gia nhiệt buồng đốt trên 1.050°C theo chuẩn ISO 834 và báo cáo tính toàn vẹn kết cấu tấm MGO 12mm tại Viện Khoa học Công nghệ Xây dựng (IBST). Hệ vách ngăn đạt chuẩn EI 120 duy trì độ ổn định chịu lực hoàn hảo và nhiệt độ mặt lưng không tăng quá mức cho phép trong suốt 2 giờ đốt lửa trực tiếp liên tục. Bài viết cung cấp toàn bộ thông số kỹ thuật buồng đốt, biểu đồ nhiệt độ mặt đón lửa, mặt không đón lửa và các lưu ý then chốt khi thi công hệ khung xương thép định hình kết hợp bông khoáng Rockwool.',
    image: '/images/mgo-wall.jpg',
    author: 'Kỹ Sư Thử Nghiệm IBST & Remak',
    tags: ['Thử nghiệm IBST', 'Giới hạn EI 120', 'Chịu nhiệt 1050 độ', 'Hệ vách chống cháy'],
    content: [
      'Tại phòng thí nghiệm lò đốt chuyên dụng của Viện IBST, mẫu vách ngăn kết hợp khung thép định hình và tấm MGO Remak 12mm 2 mặt, chèn bông khoáng Rockwool 100kg/m³ đã trải qua 120 phút thử nghiệm lửa trực tiếp.',
      'Nhiệt độ mặt đón lửa vượt mốc 1.050°C theo đường cong gia nhiệt tiêu chuẩn ISO 834, trong khi nhiệt độ trung bình mặt không đón lửa chỉ tăng dưới 110°C (thấp hơn nhiều so với giới hạn cho phép 140°C).',
      'Mẫu vách giữ nguyên độ thẳng đứng, không có vết nứt xuyên thấu khí nóng, không bắt lửa mặt sau và không tạo ra khói độc hại, xuất sắc đạt chứng nhận giới hạn chịu lửa EI 120.'
    ]
  },
  {
    id: 'giai-ma-hien-tuong-tam-mgo-chay-mo-hoi',
    slug: 'giai-ma-hien-tuong-tam-mgo-chay-mo-hoi',
    title: 'Giải Mã Hiện Tượng Tấm MGO Bị "Chảy Mồ Hôi" Và Cách Nhận Biết MGO Chuẩn',
    category: 'Kỹ Thuật Vật Liệu',
    categorySlug: 'ky-thuat',
    categoryColor: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30',
    date: '18/08/2026',
    readTime: '5 phút đọc',
    desc: 'Tại sao tấm MGO giá rẻ lại hút ẩm và đọng giọt nước muối trên bề mặt? Bí quyết kiểm tra nhanh bằng bút đo và dung dịch bạc nitrat tại công trường. Phân tích nguyên nhân nồng độ ion Chloride dư thừa dẫn đến rỉ sét kết cấu thép phụ trợ và cách chủ đầu tư kiểm tra chất lượng vật liệu đầu vào chính xác nhất. Hướng dẫn chi tiết phương pháp phân biệt tấm MGO Magie Sulfate cao cấp của Remak với các dòng sản phẩm kém chất lượng trôi nổi trên thị trường, giúp ngăn ngừa sự cố sập trần và hư hỏng hệ thống thông gió.',
    image: '/images/mgo-board.jpg',
    author: 'Chuyên Gia Vật Liệu',
    tags: ['Chảy mồ hôi MGO', 'Kiểm tra chất lượng', 'MGO Sulfate'],
    content: [
      'Hiện tượng "chảy mồ hôi" (sweating) xảy ra khi muối Magie Clorua dư thừa trong tấm phản ứng hút ẩm từ không khí tạo thành dung dịch muối ăn mòn.',
      'Dung dịch này không chỉ làm mục nát tấm mà còn ăn mòn vít bắn, phá hủy kết cấu tôn mạ kẽm và gây ẩm mốc ảnh hưởng nghiêm trọng đến chất lượng không khí bên trong công trình.',
      'Cách phân biệt: Tấm MGO chất lượng cao của Remak sử dụng muối Sulfate, bề mặt trắng mịn khô ráo vĩnh viễn, khi thử nghiệm ngâm nước không nhả muối và giữ nguyên độ bền uốn cơ học.'
    ]
  },
  {
    id: 'so-sanh-mgo-va-thach-cao-chong-chay',
    slug: 'so-sanh-mgo-va-thach-cao-chong-chay',
    title: 'So Sánh Chi Tiết: Tấm MGO Và Tấm Thạch Cao Chống Cháy, Loại Nào Kinh Tế Hơn?',
    category: 'Kỹ Thuật Vật Liệu',
    categorySlug: 'ky-thuat',
    categoryColor: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30',
    date: '10/08/2026',
    readTime: '6 phút đọc',
    desc: 'Bóc tách chi phí tổng thể gồm đơn giá vật tư, nhân công bắn nhiều lớp, trọng lượng kết cấu và độ bền trong môi trường ẩm ướt nhiệt đới Việt Nam. Đánh giá tính kinh tế vượt bậc khi ứng dụng hệ giải pháp tấm MGO 1 lớp so với hệ thạch cao chống cháy 2-3 lớp trong các dự án công nghiệp quy mô lớn. Phân tích chi tiết bài toán tải trọng sàn giảm đến 40%, rút ngắn 50% tiến độ thi công vách ngăn khoang cháy và loại bỏ triệt để nguy cơ ẩm mục nấm mốc khi thời tiết nồm ẩm kéo dài.',
    image: '/images/mgo-floor.jpg',
    author: 'Kỹ Sư Dự Toán Xây Dựng',
    tags: ['So sánh MGO Thạch Cao', 'Dự toán chi phí', 'Vách ngăn PCCC'],
    content: [
      'Mặc dù đơn giá 1 tấm thạch cao chống cháy có thể thấp hơn tấm MGO, nhưng để đạt EI 120, hệ thạch cao thường đòi hỏi 2-3 lớp mỗi mặt và khung xương dày đặc.',
      'Ngược lại, tấm MGO Remak chỉ cần 1 lớp 12mm mỗi mặt là đạt EI 120, giảm 40% trọng lượng tải trọng sàn, tiết kiệm 50% thời gian thi công và loại bỏ nguy cơ bở mục khi gặp nước.',
      'Tổng chi phí hoàn thiện tính trên mỗi m² của hệ vách MGO Remak tiết kiệm từ 15% đến 25% so với hệ thạch cao chống cháy nhiều lớp.'
    ]
  },
  {
    id: 'kinh-nghiem-hoan-thien-ho-so-nghiem-thu-pccc',
    slug: 'kinh-nghiem-hoan-thien-ho-so-nghiem-thu-pccc',
    title: 'Kinh Nghiệm Hoàn Thiện Hồ Sơ Nghiệm Thu PCCC Công Trình Nhanh Chóng',
    category: 'Kinh Nghiệm Nghiệm Thu',
    categorySlug: 'nghiem-thu',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '02/08/2026',
    readTime: '7 phút đọc',
    desc: 'Checklist giấy tờ bắt buộc: Giấy chứng nhận kiểm định mẫu, biên bản lấy mẫu hiện trường, chứng chỉ xuất xưởng CO/CQ và hóa đơn nguồn gốc vật tư. Hướng dẫn các bước phối hợp với đơn vị tư vấn giám sát và cơ quan chức năng để nghiệm thu PCCC nhanh gọn, tránh rủi ro đình trệ bàn giao công trình. Tổng hợp kinh nghiệm thực chiến từ các dự án trọng điểm như Samsung, LG, Lotte Mall giúp nhà thầu chuẩn bị hồ sơ pháp lý chuẩn chỉnh ngay từ giai đoạn trình mẫu vật liệu ban đầu.',
    image: '/images/mgo-duct.jpg',
    author: 'Bộ Phận Pháp Lý & Dự Án Remak',
    tags: ['Hồ sơ PCCC', 'Biên bản nghiệm thu', 'CO CQ', 'Kiểm định PCCC'],
    content: [
      'Một trong những vướng mắc lớn nhất của các chủ đầu tư là hồ sơ pháp lý vật liệu ngăn cháy không đồng bộ giữa thiết kế thẩm duyệt và thực tế thi công.',
      'Remak cung cấp trọn bộ hồ sơ pháp lý chuẩn chỉnh bao gồm: Chứng nhận kiểm định PCCC của Cục PCCC, kết quả thử nghiệm đốt mẫu của Viện IBST, chứng chỉ chất lượng xuất xưởng CO/CQ từ nhà máy.',
      'Nhờ hồ sơ đầy đủ, các công trình sử dụng MGO Remak như Samsung Yên Phong, Lotte Mall Tây Hồ đều được nghiệm thu PCCC nhanh chóng đúng tiến độ.'
    ]
  },
  {
    id: 'boc-ket-cau-thep-chiu-lua-r60-r120',
    slug: 'boc-ket-cau-thep-chiu-lua-r60-r120',
    title: 'Bọc Bảo Vệ Kết Cấu Thép Chịu Lửa R60 - R120 Bằng Tấm MGO Remak Chống Sập',
    category: 'Hướng Dẫn Thi Công',
    categorySlug: 'huong-dan',
    categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
    date: '25/07/2026',
    readTime: '6 phút đọc',
    desc: 'Giải pháp bọc hộp cột thép, dầm thép nhà xưởng công nghiệp bằng tấm MGO thay thế sơn chống cháy phồng nở vốn hay bị bong tróc sau vài năm. Đảm bảo khả năng bảo vệ kết cấu chịu lực không bị biến dạng sụp đổ khi nhiệt độ đám cháy vượt ngưỡng 550°C theo quy chuẩn QCVN 06:2022/BXD. Phân tích ưu thế thi công khô sạch sẽ, độ bền vĩnh viễn theo tuổi thọ công trình và chi phí bảo trì định kỳ bằng 0, là giải pháp lý tưởng cho các nhà máy hóa chất, kho vận logistics và nhà xưởng khẩu độ lớn.',
    image: '/images/mgo-board.jpg',
    author: 'Kỹ Sư Kết Cấu Thép Remak',
    tags: ['Kết cấu thép', 'Bọc cột thép', 'R120', 'Chống cháy nhà xưởng'],
    content: [
      'Ở nhiệt độ trên 550°C, thép kết cấu bắt đầu mất 50% cường độ chịu lực dẫn đến nguy cơ sập đổ nhà xưởng. Việc bọc tấm MGO FireOFF 12-15mm giúp cách nhiệt và duy trì kết cấu vững chắc đến 120 phút.',
      'So với sơn chống cháy phồng nở, giải pháp ốp tấm MGO khô hoàn toàn không chịu tác động của độ ẩm môi trường, không phát tán mùi hóa chất độc hại và có độ bền vĩnh viễn theo tuổi thọ công trình.'
    ]
  },
  {
    id: 'tieu-chuan-chong-chay-data-center',
    slug: 'tieu-chuan-chong-chay-data-center',
    title: 'Tiêu Chuẩn Chống Cháy Cho Hệ Thống Data Center & Phòng Server Máy Chủ',
    category: 'Tiêu Chuẩn PCCC',
    categorySlug: 'tieu-chuan-pccc',
    categoryColor: 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/30',
    date: '18/07/2026',
    readTime: '5 phút đọc',
    desc: 'Tại sao các trung tâm dữ liệu như Viettel IDC, FPT Telecom bắt buộc sử dụng vách ngăn MGO chống cháy EI 120 không phát sinh bụi sợi và tĩnh điện. Phân tích chi tiết yêu cầu kỹ thuật phòng sạch kết hợp giải pháp khoanh vùng cháy lan cách ly nhiệt hoàn hảo cho các tủ rack server trọng yếu. Hướng dẫn thiết kế vách ngăn chịu lửa 2 giờ, tích hợp hệ thống chữa cháy khí sạch FM200/Novec 1230 và ngăn ngừa rủi ro gián đoạn dịch vụ đám mây viễn thông khi xảy ra sự cố chập điện.',
    image: '/images/mgo-wall.jpg',
    author: 'Chuyên Gia Hạ Tầng Viễn Thông',
    tags: ['Data Center', 'Phòng Server', 'EI 120', 'Không bụi tĩnh điện'],
    content: [
      'Trung tâm dữ liệu lưu trữ các thiết bị tính toán nhạy cảm với bụi mịn và tĩnh điện. Tấm MGO Remak được hoàn thiện bề mặt chống tĩnh điện và không giải phóng bụi vô cơ, bảo đảm môi trường phòng sạch cấp độ cao nhất.',
      'Khả năng chịu lửa liên tục 120 phút giúp cô lập hoàn toàn sự cố chập điện trong khoang máy chủ, ngăn chặn lửa lan sang các phòng điều hành kế cận.'
    ]
  },
  {
    id: 'xu-ly-moi-noi-va-giap-mi-tam-mgo',
    slug: 'xu-ly-moi-noi-va-giap-mi-tam-mgo',
    title: 'Kỹ Thuật Xử Lý Mối Nối Và Giáp Mí Tấm MGO Trong Thi Công Ống Gió PCCC',
    category: 'Hướng Dẫn Thi Công',
    categorySlug: 'huong-dan',
    categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
    date: '10/07/2026',
    readTime: '5 phút đọc',
    desc: 'Sai lầm thường gặp khi dùng băng dính nhôm thay vì keo trám chịu nhiệt Remak® FireSeal khiến mối nối bị nứt và không đạt thử nghiệm kiểm định khói lửa. Hướng dẫn quy trình bả phẳng mối nối bằng vải thủy tinh gia cường kết hợp keo silicat trương nở chịu nhiệt độ cực đại trên 1.000°C. Chi tiết kỹ thuật xử lý các góc bo ống gió vuông, khớp nối mềm xuyên sàn xuyên tường và kỹ thuật bắn vít tự khoan giữ khoảng cách tiêu chuẩn 15cm giúp hệ thống ống gió đạt kín khít tuyệt đối khi chịu áp suất gió cao.',
    image: '/images/mgo-duct.jpg',
    author: 'Kỹ Sư Trưởng Công Trường',
    tags: ['Xử lý mối nối', 'Keo FireSeal', 'Ống gió PCCC', 'Thi công chuẩn'],
    content: [
      'Khe hở giữa các tấm MGO là điểm yếu nhiệt lớn nhất nếu không được xử lý đúng kỹ thuật. Sử dụng keo silicone chống cháy hoặc băng dính bạc thông thường sẽ bị chảy và bốc cháy ở 300°C.',
      'Quy trình chuẩn đòi hỏi phải sử dụng keo silicat trương nở Remak® FireSeal quét ngập khe ghép mí kết hợp băng vải thủy tinh gia cường, bảo đảm tính toàn vẹn E tối đa khi nhiệt độ lên 1.000°C.'
    ]
  },
  {
    id: 'giai-phap-cach-am-chong-chay-karaoke',
    slug: 'giai-phap-cach-am-chong-chay-karaoke',
    title: 'Giải Pháp Cách Âm & Chống Cháy Kết Hợp Cho Vách Ngăn Quán Karaoke, Bar Club',
    category: 'Kỹ Thuật Vật Liệu',
    categorySlug: 'ky-thuat',
    categoryColor: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30',
    date: '01/07/2026',
    readTime: '6 phút đọc',
    desc: 'Đáp ứng đồng thời hai bài toán khó: Cách âm trên 55dB ngăn tiếng ồn và đạt giới hạn chịu lửa EI 60 - EI 90 tuyệt đối không bắt lửa theo Nghị định mới. Ứng dụng tấm MGO kết hợp lớp tiêu âm chuyên dụng triệt tiêu rủi ro cháy nổ và đem lại chất lượng âm thanh hoàn hảo cho phòng giải trí. Đánh giá giải pháp thay thế hoàn toàn các vật liệu xốp mút dễ bắt lửa bằng hệ vách nhiều lớp gồm cao su non, bông khoáng tỷ trọng cao và tấm MGO 10-12mm bề mặt bả hoàn thiện chống cháy Class A1.',
    image: '/images/mgo-floor.jpg',
    author: 'Chuyên Gia Âm Thanh & PCCC',
    tags: ['Karaoke', 'Cách âm chống cháy', 'Vách ngăn EI 60', 'QCVN 06'],
    content: [
      'Sau các đợt siết chặt quy chuẩn PCCC cho cơ sở kinh doanh dịch vụ karaoke, các vật liệu mút xốp cách âm dễ cháy đều bị cấm hoàn toàn.',
      'Hệ vách Remak sử dụng tấm MGO 10mm kết hợp cao su non giảm chấn và bông khoáng Rockwool chống cháy tỷ trọng 80kg/m³, vừa mang lại khả năng tiêu âm cách âm vượt trội vừa đạt chuẩn chống cháy Class A1 không bắt lửa.'
    ]
  }
];
