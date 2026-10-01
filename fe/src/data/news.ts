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
    desc: 'Phân tích chi tiết quy trình thử nghiệm đốt mẫu thực tế, giới hạn chịu lửa EI30 – EI120 và điều kiện nghiệm thu tại công trình. Hướng dẫn chuẩn bị hồ sơ kiểm định PCCC theo quy định mới nhất của Cục Cảnh sát PCCC & CNCH.',
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
    desc: 'Làm rõ cơ chế kiểm soát ion Chloride (Cl-) tự do, triệt tiêu hiện tượng ăn mòn hóa học và bảo vệ kết cấu tôn kẽm ống gió vĩnh viễn không bị rỉ sét mục rỗng.',
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
    desc: 'Toàn cảnh buổi thử nghiệm gia nhiệt buồng đốt trên 1.050°C theo chuẩn ISO 834 và báo cáo tính toàn vẹn kết cấu tấm MGO 12mm tại Viện Khoa học Công nghệ Xây dựng (IBST).',
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
    desc: 'Tại sao tấm MGO giá rẻ lại hút ẩm và đọng giọt nước muối trên bề mặt? Bí quyết kiểm tra nhanh bằng bút đo và dung dịch bạc nitrat tại công trường.',
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
    desc: 'Bóc tách chi phí tổng thể gồm đơn giá vật tư, nhân công bắn nhiều lớp, trọng lượng kết cấu và độ bền trong môi trường ẩm ướt nhiệt đới Việt Nam.',
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
    desc: 'Checklist giấy tờ bắt buộc: Giấy chứng nhận kiểm định mẫu, biên bản lấy mẫu hiện trường, chứng chỉ xuất xưởng CO/CQ và hóa đơn nguồn gốc vật tư.',
    image: '/images/mgo-duct.jpg',
    author: 'Bộ Phận Pháp Lý & Dự Án Remak',
    tags: ['Hồ sơ PCCC', 'Biên bản nghiệm thu', 'CO CQ', 'Kiểm định PCCC'],
    content: [
      'Một trong những vướng mắc lớn nhất của các chủ đầu tư là hồ sơ pháp lý vật liệu ngăn cháy không đồng bộ giữa thiết kế thẩm duyệt và thực tế thi công.',
      'Remak cung cấp trọn bộ hồ sơ pháp lý chuẩn chỉnh bao gồm: Chứng nhận kiểm định PCCC của Cục PCCC, kết quả thử nghiệm đốt mẫu của Viện IBST, chứng chỉ chất lượng xuất xưởng CO/CQ từ nhà máy.',
      'Nhờ hồ sơ đầy đủ, các công trình sử dụng MGO Remak như Samsung Yên Phong, Lotte Mall Tây Hồ đều được nghiệm thu PCCC nhanh chóng đúng tiến độ.'
    ]
  }
];
