export interface Product {
  id: string;
  name: string;
  slug: string;
  eiRating: string;
  thickness: string;
  density: string;
  price: number;
  unit: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  stockStatus: 'in_stock' | 'low_stock' | 'pre_order';
  updatedAt: string;
}

export interface Application {
  id: string;
  name: string;
  slug: string;
  category: string;
  targetEI: string;
  layersCount: number;
  status: 'active' | 'draft';
  updatedAt: string;
}

export interface SampleRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  productName: string;
  thickness: string;
  status: 'new' | 'processing' | 'shipped' | 'completed';
  createdAt: string;
}

export interface TechDocument {
  id: string;
  title: string;
  code: string;
  category: 'certificate' | 'cad' | 'catalog' | 'test_report';
  fileType: string;
  fileSize: string;
  downloads: number;
  updatedAt: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Tấm MGO Bọc Ống Gió PCCC (DuctBoard)',
    slug: 'tam-mgo-boc-ong-gio-pccc',
    eiRating: 'EI 30 - EI 120',
    thickness: '5mm - 12mm',
    density: '950 - 1050 kg/m³',
    price: 185000,
    unit: 'm²',
    category: 'Ống Gió PCCC',
    status: 'active',
    stockStatus: 'in_stock',
    updatedAt: '2026-03-30',
  },
  {
    id: 'prod-2',
    name: 'Tấm MGO Tiêu Chuẩn Chống Cháy (Standard)',
    slug: 'tam-mgo-tieu-chuan-chong-chay',
    eiRating: 'Euroclass A1',
    thickness: '6mm - 12mm',
    density: '900 - 1000 kg/m³',
    price: 145000,
    unit: 'm²',
    category: 'Vách Ngăn & Trần',
    status: 'active',
    stockStatus: 'in_stock',
    updatedAt: '2026-03-28',
  },
  {
    id: 'prod-3',
    name: 'Tấm MGO Lót Sàn Chịu Lực (Heavy Duty)',
    slug: 'tam-mgo-lot-san-chiu-luc',
    eiRating: 'REI 180',
    thickness: '15mm - 18mm',
    density: '1100 - 1200 kg/m³',
    price: 320000,
    unit: 'm²',
    category: 'Sàn Chịu Lực',
    status: 'active',
    stockStatus: 'in_stock',
    updatedAt: '2026-03-25',
  },
  {
    id: 'prod-4',
    name: 'Tấm MGO Trang Trí & Tiêu Âm (Acoustic Decor)',
    slug: 'tam-mgo-trang-tri-tieu-am',
    eiRating: 'Class A',
    thickness: '8mm - 12mm',
    density: '950 kg/m³',
    price: 260000,
    unit: 'm²',
    category: 'Tiêu Âm Nội Thất',
    status: 'active',
    stockStatus: 'pre_order',
    updatedAt: '2026-03-22',
  },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    name: 'Bọc Ống Gió Chống Cháy PCCC',
    slug: 'boc-ong-gio-chong-chay-pccc',
    category: 'HVAC',
    targetEI: 'EI 30 - 120',
    layersCount: 3,
    status: 'active',
    updatedAt: '2026-03-29',
  },
  {
    id: 'app-2',
    name: 'Vách Ngăn Chống Cháy Karaoke / Bar',
    slug: 'vach-ngan-chong-chay-karaoke-bar',
    category: 'Acoustic Wall',
    targetEI: 'EI 60 - 120',
    layersCount: 4,
    status: 'active',
    updatedAt: '2026-03-27',
  },
  {
    id: 'app-3',
    name: 'Sàn Chịu Lực Nhà Thép Tiền Chế',
    slug: 'san-chieu-luc-nha-thep-tien-che',
    category: 'Flooring',
    targetEI: 'REI 180',
    layersCount: 2,
    status: 'active',
    updatedAt: '2026-03-24',
  },
  {
    id: 'app-4',
    name: 'Vách Trần Nhà Xưởng Công Nghiệp',
    slug: 'vach-tran-nha-xuong-cong-nghiep',
    category: 'Industrial',
    targetEI: 'EI 60',
    layersCount: 2,
    status: 'active',
    updatedAt: '2026-03-20',
  },
  {
    id: 'app-5',
    name: 'Lõi Cửa Thép Chống Cháy',
    slug: 'loi-cua-chong-chay',
    category: 'Fire Door',
    targetEI: 'EI 60 - 90',
    layersCount: 1,
    status: 'active',
    updatedAt: '2026-03-18',
  },
];

export const INITIAL_REQUESTS: SampleRequest[] = [
  {
    id: 'REQ-2026-001',
    customerName: 'Nguyễn Văn Tuấn',
    phone: '0912 345 678',
    email: 'tuan.nguyen@vinaconex.vn',
    company: 'Công ty CP Vinaconex 2',
    address: 'Số 52 Lạc Long Quân',
    city: 'Hà Nội',
    productName: 'Tấm MGO Bọc Ống Gió 10mm (EI 60)',
    thickness: '10mm',
    status: 'new',
    createdAt: '2026-03-31 08:30',
  },
  {
    id: 'REQ-2026-002',
    customerName: 'Trần Thị Mai',
    phone: '0988 765 432',
    email: 'mai.tran@coteccons.vn',
    company: 'Coteccons TP.HCM',
    address: 'KCN Hiệp Phước, Nhà Bè',
    city: 'TP. Hồ Chí Minh',
    productName: 'Tấm MGO Lót Sàn Chịu Lực 18mm (REI 180)',
    thickness: '18mm',
    status: 'processing',
    createdAt: '2026-03-30 14:15',
  },
  {
    id: 'REQ-2026-003',
    customerName: 'Hoàng Minh Đức',
    phone: '0903 112 233',
    email: 'duc.hoang@recons.com.vn',
    company: 'Recons Engineering',
    address: 'Đại lộ Hòa Bình',
    city: 'Đà Nẵng',
    productName: 'Tấm MGO Tiêu Chuẩn A1 8mm',
    thickness: '8mm',
    status: 'shipped',
    createdAt: '2026-03-29 11:00',
  },
  {
    id: 'REQ-2026-004',
    customerName: 'Lê Hoàng Nam',
    phone: '0945 667 889',
    email: 'nam.le@pccc-hanoi.com',
    company: 'PCCC Thăng Long',
    address: 'KCN Yên Phong',
    city: 'Bắc Ninh',
    productName: 'MGO Bọc Ống Gió EI 120 12mm',
    thickness: '12mm',
    status: 'completed',
    createdAt: '2026-03-28 09:45',
  },
];

export const INITIAL_TECH_DOCS: TechDocument[] = [
  {
    id: 'doc-1',
    title: 'Biên Bản Thử Nghiệm Chống Cháy IBST QCVN 06:2022',
    code: 'IBST-MGO-2024-089',
    category: 'test_report',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    downloads: 1420,
    updatedAt: '2026-03-15',
  },
  {
    id: 'doc-2',
    title: 'Hồ Sơ Bản Vẽ CAD Chi Tiết Bọc Ống Gió EI 60 - EI 120',
    code: 'CAD-MGO-DUCT-REV3',
    category: 'cad',
    fileType: 'DWG / ZIP',
    fileSize: '18.2 MB',
    downloads: 980,
    updatedAt: '2026-03-10',
  },
  {
    id: 'doc-3',
    title: 'Chứng Nhận Hợp Chuẩn Euroclass A1 Không Cháy',
    code: 'CERT-A1-REMAK-2025',
    category: 'certificate',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    downloads: 750,
    updatedAt: '2026-03-01',
  },
  {
    id: 'doc-4',
    title: 'Catalogue Kỹ Thuật Tổng Hợp Tấm Chống Cháy MGO 2026',
    code: 'CAT-REMAK-MGO-2026',
    category: 'catalog',
    fileType: 'PDF',
    fileSize: '12.5 MB',
    downloads: 2150,
    updatedAt: '2026-03-20',
  },
];
