export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  thickness: string[];
  fireRating: string;
  price: string;
  status: 'active' | 'draft';
  stock: number;
  updatedAt: string;
}

export interface AdminApplication {
  id: string;
  title: string;
  category: string;
  eiRating: string;
  recommendedThickness: string;
  layersCount: number;
  status: 'published' | 'draft';
  updatedAt: string;
}

export interface AdminSampleRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  solution: string;
  thickness: string;
  note?: string;
  status: 'new' | 'processing' | 'shipped' | 'completed';
  createdAt: string;
}

export interface AdminTechDoc {
  id: string;
  title: string;
  category: 'ibst' | 'cad' | 'iso' | 'catalog';
  code: string;
  fileSize: string;
  downloads: number;
  updatedAt: string;
}

export interface AdminProject {
  id: string;
  name: string;
  location: string;
  investor: string;
  area: string;
  productsUsed: string;
  year: number;
  status: 'completed' | 'ongoing';
}

export const ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-01',
    name: 'Tấm MGO Remak® FireOFF Chống Cháy A1',
    category: 'Vật Liệu Chống Cháy',
    thickness: ['5mm', '8mm', '10mm', '12mm'],
    fireRating: 'EI 30 - EI 180 (A1)',
    price: '280.000đ - 520.000đ/tấm',
    status: 'active',
    stock: 2450,
    updatedAt: '2026-09-28',
  },
  {
    id: 'prod-02',
    name: 'Tấm MGO Remak® Structural Floor Sàn Chịu Lực',
    category: 'Sàn Chịu Lực',
    thickness: ['15mm', '18mm', '20mm'],
    fireRating: 'EI 120 (A1)',
    price: '650.000đ - 890.000đ/tấm',
    status: 'active',
    stock: 1200,
    updatedAt: '2026-09-25',
  },
  {
    id: 'prod-03',
    name: 'Tấm MGO Remak® SoundOFF Cách Âm Tiêu Âm',
    category: 'Cách Âm & Tiêu Âm',
    thickness: ['10mm', '12mm'],
    fireRating: 'A1 (Rw 48 - 56 dB)',
    price: '340.000đ - 460.000đ/tấm',
    status: 'active',
    stock: 850,
    updatedAt: '2026-09-20',
  },
  {
    id: 'prod-04',
    name: 'Tấm MGO Remak® SteelGuard Bọc Kết Cấu Thép',
    category: 'Bọc Cột Thép',
    thickness: ['12mm', '15mm', '18mm'],
    fireRating: 'R 60 - R 180',
    price: '580.000đ - 820.000đ/tấm',
    status: 'active',
    stock: 620,
    updatedAt: '2026-09-18',
  },
  {
    id: 'prod-05',
    name: 'Tấm MGO Remak® Decor Vân Gỗ Tráng Phủ',
    category: 'Trang Trí Nội Thất',
    thickness: ['6mm', '8mm', '10mm'],
    fireRating: 'Chống Cháy B1/A1',
    price: '420.000đ - 590.000đ/tấm',
    status: 'draft',
    stock: 310,
    updatedAt: '2026-09-10',
  },
];

export const ADMIN_APPLICATIONS: AdminApplication[] = [
  {
    id: 'app-01',
    title: 'Bọc Bảo Vệ Ống Gió PCCC (Ductwork FireOFF)',
    category: 'Ống Gió',
    eiRating: 'EI 45, EI 90, EI 120',
    recommendedThickness: '8mm, 10mm, 12mm',
    layersCount: 3,
    status: 'published',
    updatedAt: '2026-09-29',
  },
  {
    id: 'app-02',
    title: 'Vách Ngăn Chống Cháy Nhà Xưởng & Tòa Nhà',
    category: 'Vách Ngăn',
    eiRating: 'EI 60 - EI 180',
    recommendedThickness: '10mm, 12mm, 15mm',
    layersCount: 4,
    status: 'published',
    updatedAt: '2026-09-26',
  },
  {
    id: 'app-03',
    title: 'Hệ Sàn Nhẹ Chịu Lực Kháng Nước Tuyệt Đối',
    category: 'Sàn Nhẹ',
    eiRating: 'EI 60 - EI 120',
    recommendedThickness: '15mm, 18mm, 20mm',
    layersCount: 3,
    status: 'published',
    updatedAt: '2026-09-22',
  },
  {
    id: 'app-04',
    title: 'Bọc Bảo Vệ Dầm Cột Kết Cấu Thép Chống Cháy',
    category: 'Cột & Dầm Thép',
    eiRating: 'R 60, R 90, R 120, R 180',
    recommendedThickness: '12mm, 15mm',
    layersCount: 4,
    status: 'published',
    updatedAt: '2026-09-19',
  },
  {
    id: 'app-05',
    title: 'Cửa Chống Cháy Cách Âm Khung Thép Lõi MGO',
    category: 'Cửa Chống Cháy',
    eiRating: 'EI 60 - EI 90',
    recommendedThickness: '5mm, 6mm, 8mm',
    layersCount: 3,
    status: 'published',
    updatedAt: '2026-09-15',
  },
];

export const ADMIN_REQUESTS: AdminSampleRequest[] = [
  {
    id: 'REQ-2026-089',
    customerName: 'Nguyễn Văn Hùng',
    phone: '0912 345 678',
    email: 'hung.nguyen@vinaconex.vn',
    company: 'Công ty CP Xây Dựng Vinaconex',
    address: 'Khu Công Nghiệp Yên Phong, Bắc Ninh',
    solution: 'Bọc Ống Gió PCCC (EI 90)',
    thickness: '10mm',
    note: 'Cần gửi mẫu gấp để nộp hồ sơ trình duyệt mẫu Ban QLDA.',
    status: 'new',
    createdAt: '2026-09-30 09:15',
  },
  {
    id: 'REQ-2026-088',
    customerName: 'Trần Thị Thu Hà',
    phone: '0988 765 432',
    email: 'hatran@coteccons.vn',
    company: 'Coteccons Group',
    address: 'Dự án Grand Marina, Quận 1, TP.HCM',
    solution: 'Vách Ngăn Cháy EI 120',
    thickness: '12mm',
    note: 'Yêu cầu kèm theo biên bản thử nghiệm IBST công chứng.',
    status: 'processing',
    createdAt: '2026-09-29 16:40',
  },
  {
    id: 'REQ-2026-087',
    customerName: 'Lê Minh Tuấn',
    phone: '0903 112 233',
    email: 'tuanlm@hoa-binh.com.vn',
    company: 'Tập Đoàn Xây Dựng Hòa Bình',
    address: 'Dự án Eco Central Park, Vinh, Nghệ An',
    solution: 'Sàn Nhẹ Chịu Lực (18mm)',
    thickness: '18mm',
    note: 'Gửi về VP Hà Nội trước thứ 6 tuần này.',
    status: 'shipped',
    createdAt: '2026-09-28 11:20',
  },
  {
    id: 'REQ-2026-086',
    customerName: 'Đặng Quốc Bảo',
    phone: '0934 999 888',
    email: 'bao.dq@delta.com.vn',
    company: 'Delta Civil & Industrial Engineering',
    address: 'Khu công nghệ cao Hòa Lạc, Hà Nội',
    solution: 'Bọc Cột Thép R 120',
    thickness: '15mm',
    note: 'Đã hoàn tất gửi mẫu và nghiệm thu đạt chuẩn.',
    status: 'completed',
    createdAt: '2026-09-26 14:05',
  },
];

export const ADMIN_TECH_DOCS: AdminTechDoc[] = [
  {
    id: 'doc-01',
    title: 'Biên Bản Thử Nghiệm Chịu Lửa EI 120 Ống Gió - Viện IBST',
    category: 'ibst',
    code: 'IBST-2024-FR-0921',
    fileSize: '4.8 MB',
    downloads: 1420,
    updatedAt: '2026-09-20',
  },
  {
    id: 'doc-02',
    title: 'Bản Vẽ CAD Thi Công Vách Ngăn Chống Cháy EI 150',
    category: 'cad',
    code: 'DWG-MGO-WALL-150',
    fileSize: '12.4 MB',
    downloads: 980,
    updatedAt: '2026-09-18',
  },
  {
    id: 'doc-03',
    title: 'Chứng Chỉ Không Cháy Nhóm A1 QCVN 06:2022/BXD',
    category: 'iso',
    code: 'CQ-REMAK-MGO-A1',
    fileSize: '2.1 MB',
    downloads: 2150,
    updatedAt: '2026-09-15',
  },
  {
    id: 'doc-04',
    title: 'Catalog Toàn Diện Sản Phẩm & Giải Pháp Tấm MGO Remak 2026',
    category: 'catalog',
    code: 'CATALOG-REMAK-2026',
    fileSize: '18.6 MB',
    downloads: 3410,
    updatedAt: '2026-09-10',
  },
];

export const ADMIN_PROJECTS: AdminProject[] = [
  {
    id: 'proj-01',
    name: 'Trung Tâm Dữ Liệu Quốc Gia (Viettel Data Center)',
    location: 'Khu Công Nghệ Cao Hòa Lạc, Hà Nội',
    investor: 'Tập đoàn Công nghiệp - Viễn thông Quân đội',
    area: '24.000 m²',
    productsUsed: 'Tấm MGO FireOFF 12mm & Hệ Sàn 18mm',
    year: 2024,
    status: 'completed',
  },
  {
    id: 'proj-02',
    name: 'Tổ Hợp Nhà Máy Bán Dẫn Hana Micron Vina',
    location: 'KCN Vân Trung, Bắc Giang',
    investor: 'Hana Micron Vina Inc',
    area: '18.500 m²',
    productsUsed: 'Ống gió MGO EI 120 & Vách Ngăn EI 150',
    year: 2025,
    status: 'completed',
  },
  {
    id: 'proj-03',
    name: 'Bệnh Viện Đa Khoa Quốc Tế Vinmec Smart City',
    location: 'Nam Từ Liêm, Hà Nội',
    investor: 'Tập đoàn Vingroup',
    area: '15.000 m²',
    productsUsed: 'Tấm MGO SoundOFF & Trần Chống Ẩm 8mm',
    year: 2025,
    status: 'ongoing',
  },
];
