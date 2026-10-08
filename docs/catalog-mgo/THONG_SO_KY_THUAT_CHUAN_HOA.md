# TỔNG HỢP THÔNG SỐ KỸ THUẬT & THIẾT KẾ DATA MODEL SẢN PHẨM MGO

Tài liệu này được bóc tách và chuẩn hóa trực tiếp từ **Catalogue Remak® FireOFF MgO Board**, lọc bỏ các trường trùng lặp, giải quyết mâu thuẫn dữ liệu giữa các dòng sản phẩm, và bổ sung các trường còn thiếu để phục vụ thiết kế Schema / Data Model (TypeScript / Database).

---

## PHẦN 1: BẢNG PHÂN TÍCH TRÙNG LẶP & THIẾU SÓT

| Thông số từ Catalogue | Tình trạng | Phân tích & Hướng chuẩn hóa cho Model |
| :--- | :---: | :--- |
| **Kích thước** & **Kích thước tiêu chuẩn** | **Trùng lặp** | Gộp thành 1 trường `dimensions: string[]` hoặc `standardSize: string`. Tấm vách/SIP thường là `1220 × 2440 mm`, tấm sàn có thêm quy cách `2700 × 600 mm`. |
| **Chiều rộng** & **Chiều dài** | **Dư thừa** | Đã nằm trong trường kích thước. Chỉ cần dùng khi làm sản phẩm SIP custom (`maxWidth: 1220mm`, `maxLength: 3050mm`). |
| **Độ dày** & **Độ dày phổ biến** | **Trùng lặp** | Gộp thành `thicknessList: string[]`. Tấm vách: `10mm, 12mm`; Tấm sàn: `16, 18, 19, 20, 22mm`; Tấm tiêu chuẩn: `5mm – 18mm`. |
| **Bề mặt hoàn thiện** & **Mặt chà nhám** | **Trùng lặp / Gần nghĩa** | Gộp thành `surfaceFinish: string` (VD: *"Nhẵn mịn"*, *"Chà nhám phẳng"*, *"Phủ HPL"*, *"Màng PVC"*, *"Sơn chống cháy"*). |
| **Lõi cách nhiệt** & **Độ dày lõi** | **Riêng biệt (Chỉ dành cho SIP)** | Không áp dụng cho tấm phẳng MgO thông thường. Nên tách thành nhóm thuộc tính riêng: `sipCoreMaterial`, `sipCoreThickness`. |
| **Kiểu cạnh (Edge Profile)** | **Riêng biệt (Quan trọng cho Sàn/Vách)** | Tấm sàn dùng: *Âm Dương T&G*, *Shiplap*. Tấm tường thường là: *Cạnh phẳng (Square Edge)* hoặc *Vát cạnh/Rãnh V*. |
| **Khối lượng riêng (Tỷ trọng)** | **Khác nhau theo dòng** | Tấm vách tiêu chuẩn: `950 – 1.150 kg/m³`. Tấm sàn chịu lực: `1200 – 1250 kg/m³`. Tấm LiteCore: giảm ~70%. |
| **Các chỉ số còn THIẾU trong mẫu tóm tắt** | **Bị thiếu** | Cần bổ sung ngay: **Hệ số dẫn nhiệt** ($0.169\text{ W/mK}$), **Độ hấp thụ nước** ($<15\%$), **Khả năng cách âm** ($35-52\text{ dB}$), **Chịu nhiệt độ cực hạn** ($2.852^\circ\text{C}$). |

---

## PHẦN 2: BẢNG THÔNG SỐ KỸ THUẬT TỔNG HỢP ĐẦY ĐỦ (DATA SHEET)

### 1. Nhóm Kích thước & Quy cách hình học (Physical Dimensions)

| Tên trường (Field Name) | Giá trị tiêu chuẩn | Giá trị tùy chọn / Dòng đặc thù |
| :--- | :--- | :--- |
| **Kích thước tiêu chuẩn** | `1220 × 2440 mm` (4ft × 8ft) | `2700 × 600 mm` (Tấm sàn module)<br>Gia công theo thiết kế dự án |
| **Chiều rộng tối đa** | `1220 mm` | Có thể cắt xẻ theo yêu cầu |
| **Chiều dài tối đa** | `2440 mm` | Lên đến `3050 mm+` (cho panel SIP) |
| **Độ dày tiêu chuẩn (Tấm vách/trần)**| `5mm, 8mm, 10mm, 12mm` | `6mm, 15mm` |
| **Độ dày tấm sàn chịu lực** | `16mm, 18mm, 19mm, 20mm, 22mm` | `25mm+` (Extra Heavy Duty) |
| **Kiểu cạnh (Edge Profile)** | Cạnh vuông phẳng (Square edge) | • Âm Dương (T&G - Tongue & Groove)<br>• Cạnh vát Shiplap<br>• Rãnh chữ V (V-Groove) |
| **Màu sắc cốt tấm** | Trắng ngà (Off-white) | Xám nhạt (Light Grey) / Xám bê tông |
| **Hoàn thiện bề mặt (Finish)** | Nhẵn phẳng tiêu chuẩn | • Chà nhám phẳng (cho tấm sàn)<br>• Phủ Laminate HPL<br>• Dán màng PVC<br>• Sơn trương nở chống cháy<br>• Bề mặt in 3D / Hoa văn nổi |

---

### 2. Nhóm Cơ lý & Tải trọng (Mechanical Properties)

| Tên trường (Field Name) | Giá trị tiêu chuẩn | Ghi chú kỹ thuật |
| :--- | :--- | :--- |
| **Khối lượng riêng (Tấm tiêu chuẩn)**| **950 – 1.150 kg/m³** | Nhẹ hơn tấm xi măng Cemboard |
| **Khối lượng riêng (Tấm sàn cao cấp)**| **1.200 – 1.250 kg/m³** | Mật độ cao, chống võng, chịu tải nặng |
| **Khối lượng riêng (Tấm LiteCore™)** | **Nhẹ hơn ~70%** | Tích hợp hạt EPS siêu nhẹ |
| **Cường độ chịu uốn (Flexural)** | $\mathbf{\ge 15 - 25\text{ MPa}}$ | Chiều dọc $\ge 20-25\text{ MPa}$, ngang $\ge 12-15\text{ MPa}$ |
| **Khả năng bám giữ vít** | Xuất sắc | Bắt vít trực tiếp không nứt mép |

---

### 3. Nhóm Phòng cháy & Nhiệt học (Fire & Thermal Properties)

| Tên trường (Field Name) | Giá trị tiêu chuẩn | Tiêu chuẩn chứng nhận |
| :--- | :--- | :--- |
| **Cấp độ chống cháy vật liệu** | **Class A / Euroclass A1** | ASTM E84, EN 13501-1, UL 055 |
| **Nhiệt độ chịu nhiệt cực hạn** | **2.852°C** | Không nứt vỡ, không biến dạng, không khói độc |
| **Giới hạn chịu lửa hệ vách (Fire Rating)**| **EI 30, EI 45, EI 60, EI 90, EI 120, EI 180** | Đốt mẫu theo QCVN 06:2022/BXD |
| **Hệ số dẫn nhiệt ($\lambda$)** | **$0.169\text{ W/(m}\cdot\text{K)}$** | Cách nhiệt cao, tiết kiệm điện năng điều hòa |

---

### 4. Nhóm Kháng ẩm & Âm học (Acoustic & Moisture)

| Tên trường (Field Name) | Giá trị tiêu chuẩn | Ghi chú kỹ thuật |
| :--- | :--- | :--- |
| **Khả năng cách âm** | Giảm từ **35 dB đến 52 dB** | Tấm dày 10–12mm đạt mức giảm **45 dB** |
| **Độ hấp thụ nước (24h)** | **$< 15\%$** | Ngâm nước không rã, không mục mủn |
| **Độ trương nở chiều dày** | **$< 0.08\%$** | Kích thước ổn định tuyệt đối |
| **Khả năng chống nấm mốc / mối mọt** | Tuyệt đối (Không bị xâm hại) | Vật liệu khoáng vô cơ kiềm tính |

---

### 5. Nhóm An toàn & Môi trường (Safety & Environment)

| Tên trường (Field Name) | Giá trị tiêu chuẩn | Tiêu chuẩn chứng nhận |
| :--- | :--- | :--- |
| **Thành phần độc hại (Amiăng)** | **0% (Asbestos-free)** | An toàn sức khỏe 100% |
| **Phát thải Formaldehyde** | **$0.0\text{ mg/L}$ (Chuẩn E0)** | Không mùi, không phát tán khí độc |
| **Hóa chất bay hơi (VOC)** | Cực thấp | Đạt chuẩn LEED và GREEN STAR |
| **Cấu trúc tinh thể cốt lõi** | **Pha tinh thể 517** ($5\text{Mg(OH)}_2\cdot\text{MgSO}_4\cdot 7\text{H}_2\text{O}$) | Bền vững hóa học, chống toát mồ hôi muối |

---

### 6. Nhóm thông số mở rộng (Dành riêng cho Panel SIP MgO)

| Tên trường (Field Name) | Giá trị |
| :--- | :--- |
| **Vật liệu lõi cách nhiệt** | EPS (Expanded Polystyrene), XPS, PU cứng, PIR, Foam Phenolic |
| **Độ dày lõi cách nhiệt** | $50\text{mm} – 200\text{mm+}$ (tùy biến) |
| **Tấm ốp mặt ngoài** | Tấm MgO dày 10mm hoặc 12mm (2 mặt) |

---

## PHẦN 3: GỢI Ý TYPESCRIPT DATA MODEL / SCHEMA

Dưới đây là cấu trúc interface chuẩn hóa để bạn gắn vào backend/frontend hoặc CMS mà không bị xung đột:

```typescript
export interface MgOSpecification {
  // 1. Kích thước & Hình học
  dimensions: string[];             // ['1220 x 2440 mm', '2700 x 600 mm']
  thicknessList: string[];          // ['5mm', '8mm', '10mm', '12mm', '15mm', '18mm', '20mm', '22mm']
  maxWidth?: string;                // '1220 mm'
  maxLength?: string;               // '3050 mm'
  edgeProfile: 'square' | 'tongue_groove' | 'shiplap' | 'v_groove';
  color: 'off_white' | 'light_grey';
  surfaceFinish: string;            // 'Bề mặt nhẵn' | 'Chà nhám phẳng' | 'Phủ HPL' | 'Màng PVC' | 'In 3D'

  // 2. Cơ lý & Khối lượng
  density: string;                  // '950 - 1150 kg/m³' (Tiêu chuẩn) hoặc '1200 - 1250 kg/m³' (Sàn)
  flexuralStrength: string;         // '≥ 25 MPa'
  screwHoldingPower?: string;       // 'Xuất sắc'

  // 3. Kháng cháy & Nhiệt
  fireRating: string;               // 'Euroclass A1, Class A ASTM E84'
  fireLimits: string[];             // ['EI 30', 'EI 60', 'EI 90', 'EI 120', 'EI 180']
  maxTemperatureResistance: string;// '2.852°C'
  thermalConductivity: string;      // '0.169 W/(m·K)'

  // 4. Âm học & Độ ẩm
  soundInsulation: string;          // '35 dB - 52 dB (giảm 45 dB)'
  waterAbsorption: string;          // '< 15%'
  thicknessSwellingRate: string;    // '< 0.08%'
  moldResistance: boolean;          // true

  // 5. An toàn & Môi trường
  asbestosFree: boolean;            // true (0%)
  formaldehydeEmission: string;     // '0.0 mg/L (E0)'
  vocEmission: string;              // 'Low VOC'
  coreCrystalPhase: string;         // 'Pha tinh thể 517'
  greenCertifications: string[];    // ['LEED', 'GREEN STAR']

  // 6. Mở rộng riêng cho dòng Panel SIP (Optional)
  sipConfig?: {
    coreMaterials: ('EPS' | 'XPS' | 'PU' | 'PIR' | 'Phenolic')[];
    coreThickness: string;          // '50mm - 200mm+'
    facingThickness: string;        // '10mm - 12mm'
  };

  // 7. Ứng dụng chính
  applications: string[];           // ['Vách ngăn nội thất', 'Lót sàn chịu lực', 'Ống gió PCCC', ...]
}
```
