# HỆ THỐNG MÀU SẮC THƯƠNG HIỆU & GIAO DIỆN SÁNG (LIGHT THEME BRAND DESIGN SYSTEM)
*Dành riêng cho Website Tấm Chống Cháy MGO Remak®*

Tài liệu này chuẩn hóa toàn bộ mã màu, quy tắc thị giác và hệ thống CSS Tokens được bóc tách trực tiếp từ logo thương hiệu Remak (`reference_images/mgo_vietnam/Logo_remak_800.png`) kết hợp định hướng **Giao diện sáng (Light Theme)** để tối ưu khả năng đọc, tạo niềm tin cho đối tác kỹ thuật/nhà thầu và đẩy mạnh tỷ lệ chuyển đổi.

---

## 1. TẠI SAO GIAO DIỆN SÁNG (LIGHT THEME) LÀ LỰA CHỌN SỐ 1 CHO NGÀNH VLXD?

1. **Thói quen đọc hồ sơ kỹ thuật:** Kỹ sư, chủ đầu tư và nhà thầu PCCC thường xuyên xem bảng tra thông số, kết quả thử nghiệm đốt và báo giá. Nền sáng (Trắng / Xám nhạt) giúp bảng biểu rõ ràng, không gây mỏi mắt và in ấn ra giấy A4 cực đẹp.
2. **Độ hiển thị ngoài trời công trình:** Thợ thi công và giám sát thường mở điện thoại tra cứu cứu ngay tại công trường dưới ánh sáng mạnh; giao diện sáng có độ tương phản cao giúp dễ nhìn hơn rất nhiều so với giao diện tối.
3. **Cảm giác tin cậy & minh bạch:** Trong ngành vật liệu xây dựng và an toàn PCCC, nền sáng mang lại cảm giác chuyên nghiệp, sạch sẽ, chuẩn chỉ và uy tín từ nhà máy lớn.

---

## 2. PHÂN TÍCH 2 MÀU CỐT LÕI TỪ LOGO REMAK

| Màu thương hiệu | Mã HEX | Ý nghĩa biểu trưng trong ngành MGO | Ứng dụng trên Website |
| :--- | :--- | :--- | :--- |
| **XANH LÁ REMAK (Eco Leaf Green)** | `#7CB305`<br>`rgb(124, 179, 5)` | **Vật liệu sinh thái xanh:** Đại diện cho tiêu chuẩn vật liệu không độc tố, không amiăng, an toàn sức khỏe và thân thiện với môi trường tự nhiên. | • Thanh Header Topbar / Logo<br>• Tiêu đề mục & Icon tính năng xanh<br>• Huy hiệu "An toàn cho sức khỏe"<br>• Nền các thẻ chứng nhận môi trường |
| **CAM LỬA REMAK (Fire Orange)** | `#F26522`<br>`rgb(242, 101, 34)` | **Nhiệt năng & PCCC:** Màu cam của ngọn lửa và ngành PCCC. Tạo cảm giác năng động, khẩn trương, chống chịu nhiệt độ cao $1200^\circ\text{C}$. | • **Nút kêu gọi hành động chính (CTA)**<br>• Nút "Nhận Mẫu Thử Miễn Phí"<br>• Nút "Báo Giá Nhanh" / Hotline<br>• Badge chỉ số chống cháy EI 60, EI 120 |

---

## 3. NGUYÊN TẮC PHỐI MÀU 60 - 30 - 10 (GIAO DIỆN SÁNG CHUẨN UI/UX)

```
┌─────────────────────────────────────────────────────────────┐
│ 60% MÀU NỀN SÁNG (Trắng tinh khiết & Xám ngọc trai Slate)   │
│ ├─ Nền web: #F8FAFC                                         │
│ └─ Nền thẻ Card / Bảng: #FFFFFF                             │
├─────────────────────────────────────────────────────────────┤
│ 30% MÀU KẾT CẤU & THƯƠNG HIỆU                               │
│ ├─ Xanh lá Remak: #7CB305 (Thương hiệu, Icon, Tiêu đề phụ)  │
│ └─ Xám than chì: #1E293B (Chữ chính nét căng, tương phản)   │
├─────────────────────────────────────────────────────────────┤
│ 10% MÀU ĐIỂM NHẤN CHUYỂN ĐỔI (ACCENT CONVERSION)            │
│ └─ Cam PCCC Remak: #F26522 (Nút Mua, Báo Giá, Hotline, EI) │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. BẢNG MÃ MÀU TOÀN DIỆN (FULL COLOR PALETTE TOKENS)

### 4.1 Bộ màu Thương hiệu (Brand Colors)
* **Remak Green (Chính):** `#7CB305` *(Xanh lá tươi đặc trưng logo)*
* **Remak Green Dark:** `#5F8A03` *(Dùng khi di chuột hover hoặc text trên nền sáng)*
* **Remak Green Light:** `#F4F9E8` *(Nền icon xanh, badge xanh nhạt)*
* **Remak Orange (Chính):** `#F26522` *(Cam lửa PCCC đặc trưng logo)*
* **Remak Orange Hover:** `#D95314` *(Khi hover nút bấm)*
* **Remak Orange Light:** `#FEF3EC` *(Nền tag giá, badge "Hot", dải ưu đãi)*

### 4.2 Bộ màu Nền sáng & Trung tính (Light Neutral Colors)
* **Background Body:** `#F8FAFC` *(Màu xám Slate 50 siêu dịu mắt, tránh chói lóa như trắng 100%)*
* **Surface Card:** `#FFFFFF` *(Trắng tinh khiết làm nổi bật từng khối sản phẩm)*
* **Border Subdued:** `#E2E8F0` *(Đường viền mỏng 1px tinh tế ngăn cách các bảng)*
* **Border Focused:** `#CBD5E1` *(Đường viền khi rê chuột vào khung nhập liệu)*

### 4.3 Bộ màu Văn bản (Typography Colors)
* **Text Heading (Tiêu đề):** `#0F172A` *(Đen ánh xanh đậm Slate 900 - cực kỳ quyền uy, sắc nét)*
* **Text Body (Nội dung chính):** `#334155` *(Xám than chì Slate 700 - độ tương phản chuẩn WCAG 2.1)*
* **Text Muted (Chú thích, kích thước):** `#64748B` *(Xám ghi Slate 500)*

### 4.4 Bộ màu Chuyên ngành PCCC & Cảnh báo (Functional Colors)
* **PCCC Red (Báo cháy / Cấp độ cao):** `#DC2626` *(Cho nhãn EI 90, EI 120)*
* **Success Green (Đạt kiểm định):** `#16A34A` *(Cho dấu tick đạt chuẩn QCVN)*
* **Rating Gold (Đánh giá chất lượng):** `#F59E0B` *(5 sao đánh giá từ khách hàng)*

---

## 5. ĐOẠN MÃ CSS VARIABLES CHUẨN (`:root`)

Dán trực tiếp vào file CSS chính của bạn (`index.css` hoặc `globals.css`):

```css
:root {
  /* Brand Identity Colors */
  --remak-green: #7CB305;
  --remak-green-dark: #5F8A03;
  --remak-green-light: #F4F9E8;
  
  --remak-orange: #F26522;
  --remak-orange-dark: #D95314;
  --remak-orange-light: #FEF3EC;

  /* Light Theme Layout */
  --bg-page: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-muted: #F1F5F9;
  
  /* Text & Contrast */
  --text-primary: #0F172A;
  --text-secondary: #334155;
  --text-muted: #64748B;
  --text-white: #FFFFFF;

  /* Borders & Shadows */
  --border-color: #E2E8F0;
  --border-hover: #CBD5E1;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
  --shadow-orange: 0 10px 20px -3px rgba(242, 101, 34, 0.25);

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

---

## 6. QUY TẮC THIẾT KẾ CÁC THÀNH PHẦN GIAO DIỆN (UI COMPONENTS)

### 6.1 Nút bấm Kêu gọi hành động (CTA Buttons)
* **Nút chính (Primary CTA):**
  * Màu nền: `var(--remak-orange)` (`#F26522`)
  * Màu chữ: `White`
  * Bo góc: `8px` hoặc `10px`
  * Đổ bóng: `var(--shadow-orange)`
  * Khi hover: Chuyển sang `var(--remak-orange-dark)` (`#D95314`), nâng nhẹ `translateY(-2px)`
  * *Áp dụng:* Nút "Nhận Mẫu Thử Miễn Phí", "Báo Giá Nhanh", "Tải Báo Giá".
* **Nút phụ (Secondary CTA):**
  * Nền: `var(--remak-green-light)`
  * Viền: `1.5px solid var(--remak-green)`
  * Màu chữ: `var(--remak-green-dark)`
  * *Áp dụng:* Nút "Xem Chi Tiết", "Tải Hồ Sơ PCCC", "Xem Dự Án".

### 6.2 Thẻ sản phẩm (Product Card - Nền sáng)
* Nền: Trắng `#FFFFFF`
* Viền: `1px solid var(--border-color)`
* Khi di chuột (Hover): Viền chuyển sang `var(--remak-green)`, đổ bóng mềm `var(--shadow-lg)`
* Huy hiệu góc (Badge): 
  * Huy hiệu EI PCCC: Nền Cam `var(--remak-orange-light)` chữ Cam đậm
  * Huy hiệu Chống nước / Eco: Nền Xanh `var(--remak-green-light)` chữ Xanh lá đậm

### 6.3 Bảng thông số kỹ thuật (Spec Table)
* Header bảng: Nền Xanh nhạt `#F4F9E8`, chữ Xanh đậm `#5F8A03` in hoa `font-weight: 600`.
* Dòng chẵn: Nền Trắng `#FFFFFF`.
* Dòng lẻ: Nền Xám ngọc trai siêu nhẹ `#F8FAFC`.
* Viền: `#E2E8F0` mỏng nhẹ, mang lại cảm giác khoa học, chính xác.

---

## 7. BẢNG PHỐI MÀU GIAO DIỆN MẪU TỪNG KHU VỰC

```
┌─────────────────────────────────────────────────────────────────┐
│ TOPBAR (Xám nhạt #F1F5F9) - Hotline Cam #F26522 - Email - Map    │
├─────────────────────────────────────────────────────────────────┤
│ NAVBAR CHÍNH (Nền Trắng #FFFFFF)                                │
│ [Logo Remak Xanh/Cam] - Menu chữ Slate #0F172A - [Nút Mẫu Thử]  │
├─────────────────────────────────────────────────────────────────┤
│ HERO BANNER (Nền Trắng ngà Gradient nhẹ sang Xanh mạ cực nhạt)   │
│ Tiêu đề chữ đậm #0F172A - Điểm nhấn chữ CAM #F26522             │
│ [NÚT CAM: NHẬN MẪU THỬ]   [NÚT VIỀN XANH: DỰ TOÁN VẬT TƯ]        │
├─────────────────────────────────────────────────────────────────┤
│ KHỐI TÍNH NĂNG (Nền #F8FAFC - Các Card màu trắng đổ bóng nhẹ)   │
│ Icon tròn nền Xanh lá nhạt #F4F9E8, hình vẽ Xanh Remak #7CB305  │
├─────────────────────────────────────────────────────────────────┤
│ KHỐI SẢN PHẨM & GIẢI PHÁP PCCC                                  │
│ Thẻ sản phẩm trắng, viền mỏng, nhãn chống cháy EI 60 Cam        │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER (Nền Xám than đậm #0F172A hoặc Xám sáng thương nghiệp)   │
│ Logo, chứng nhận PCCC, địa chỉ nhà máy KCN Mông Hóa - Hòa Bình  │
└─────────────────────────────────────────────────────────────────┘
```
