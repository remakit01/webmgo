# Remak® MGO FireOFF - Hệ Thống Quản Trị Nội Dung (CMS)

Hệ thống quản trị nội dung (CMS) xây dựng bằng **Next.js App Router**, **TypeScript**, **Tailwind CSS v4** và **Lucide Icons** dành riêng cho hệ thống sản phẩm & giải pháp chống cháy **Tấm MGO Remak® FireOFF**.

---

## 🚀 Các Tính Năng Quản Trị Chính

1. **Dashboard Tổng Quan (`/`)**:
   - Thống kê thời gian thực: Tổng sản phẩm, giải pháp thi công, số lượng đơn yêu cầu mẫu chờ xử lý, số lượt tải hồ sơ kiểm định IBST.
   - Bảng theo dõi và chuyển trạng thái nhanh các đơn đăng ký mẫu gửi về từ website.
   - Phím tắt tạo nhanh sản phẩm, xem danh sách.

2. **Quản Lý Sản Phẩm MGO (`/products`)**:
   - Quản lý danh mục sản phẩm: MGO FireOFF, Structural Floor, SoundOFF, SteelGuard, Decor...
   - CRUD (Thêm, Sửa, Xóa, Đổi trạng thái Active/Draft, cập nhật dải độ dày và cấp chống cháy EI).
   - Bộ lọc theo phân loại sản phẩm và ô tìm kiếm tức thì.

3. **Quản Lý Giải Pháp Thi Công (`/applications`)**:
   - Quản lý hệ thống giải pháp: Bọc ống gió PCCC, Vách ngăn chống cháy, Sàn nhẹ chịu lực, Cột & dầm thép, Cửa chống cháy.
   - Cấu hình cấp chịu lửa EI (EI 30 - EI 180), độ dày khuyến nghị và số lớp cấu tạo.

4. **Quản Lý Yêu Cầu Mẫu & Báo Giá (`/sample-requests`)**:
   - Tiếp nhận thông tin đăng ký hộp mẫu MGO từ kỹ sư, chủ đầu tư, tổng thầu.
   - Chi tiết: Tên, SĐT, Email, Tên công ty, Địa chỉ nhận mẫu, giải pháp & độ dày mong muốn.
   - Xử lý quy trình 4 bước: **Chờ Xử Lý** ➜ **Đang Chuẩn Bị** ➜ **Đang Gửi Hàng** ➜ **Đã Nghiệm Thu**.
   - Nút gọi điện thoại nhanh cho khách hàng.

5. **Thư Viện Kỹ Thuật & Hồ Sơ Kiểm Định (`/tech-library`)**:
   - Quản lý biên bản thử nghiệm đốt lò IBST, bản vẽ CAD thi công (DWG) và chứng chỉ PCCC QCVN 06:2022/BXD.
   - Quản lý mã hồ sơ, dung lượng tệp và lượt tải về.

6. **Dự Án Tiêu Biểu (`/projects`)**:
   - Quản lý hồ sơ năng lực các công trình đã thi công MGO Remak (Data center, nhà máy bán dẫn, bệnh viện...).

7. **Bảng So Sánh Đối Chuẩn Vật Liệu (`/comparisons`)**:
   - Tinh chỉnh nội dung đối đầu trực tiếp giữa Tấm MGO Remak®, Cemboard và Thạch cao.

---

## 🛠 Hướng Dẫn Cài Đặt & Chạy Thử Nghiệm

Mở terminal tại thư mục `cms/`:

```bash
cd d:\webmgo\cms
pnpm install
pnpm dev
```

CMS sẽ chạy tại cổng **`http://localhost:3001`** (độc lập với website chính chạy tại cổng `3000`).

---

## 📁 Cấu Trúc Thư Mục CMS

```
webmgo/cms/
├── src/
│   ├── app/
│   │   ├── applications/page.tsx   # Quản lý giải pháp
│   │   ├── comparisons/page.tsx    # Cấu hình bảng so sánh
│   │   ├── products/page.tsx       # Quản lý sản phẩm
│   │   ├── projects/page.tsx       # Quản lý dự án
│   │   ├── sample-requests/page.tsx# Xử lý đơn nhận mẫu
│   │   ├── tech-library/page.tsx   # Hồ sơ & chứng chỉ IBST
│   │   ├── globals.css             # Tailwind CSS v4
│   │   ├── layout.tsx              # Root Layout + Sidebar
│   │   └── page.tsx                # Dashboard Tổng Quan
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx          # Topbar điều hướng
│   │       └── Sidebar.tsx         # Menu phân hệ quản trị
│   ├── lib/
│   │   └── mock-data.ts            # Dữ liệu ban đầu
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```
