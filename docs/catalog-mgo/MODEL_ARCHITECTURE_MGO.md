# THIẾT KẾ CÁC MODEL CHUẨN HÓA CHO DỮ LIỆU SẢN PHẨM MGO

> **Chiến lược kiến trúc dữ liệu**:
> Không nhồi nhét tất cả vào 1 Model lớn vì các sản phẩm thực tế có cấu tạo rất khác nhau:
> - **Tấm phẳng đơn (Vách/Trần)** khác hoàn toàn **Tấm Panel SIP có lõi**.
> - **Tấm sàn chịu lực** có hèm khóa âm dương & tải trọng uốn, còn **Tấm trang trí** lại cần quản lý lớp bề mặt HPL/PVC/In 3D.
> - **Quy cách theo độ dày (5mm, 8mm, 10mm...)** là các biến thể (SKU / Variant) có giá bán, khối lượng và chuẩn EI khác nhau.

---

## TỔNG QUAN PHÂN TÁCH HỆ THỐNG MODEL

Chúng ta chia thành **5 Models độc lập và liên kết chặt chẽ**:

1. **`ProductCore` (Model Gốc/Chung)**: Chứa thông tin nhận diện, danh mục, hình ảnh, bài viết, chứng chỉ chung.
2. **`ProductVariant` / `ProductThicknessSpec` (Model Biến thể theo độ dày)**: Quản lý từng quy cách độ dày (5mm, 8mm, 10mm, 18mm...), khối lượng/tấm, cấp EI, giá bán.
3. **`SipPanelSpec` (Model chuyên biệt cho Panel SIP MgO)**: Quản lý loại lõi cách nhiệt, độ dày lõi, quy cách khổ SIP.
4. **`FloorBoardSpec` (Model chuyên biệt cho Tấm Sàn MgO)**: Quản lý hèm khóa T&G/Shiplap, độ uốn $\ge 25\text{MPa}$, mặt chà nhám.
5. **`DecorativeFinishSpec` (Model chuyên biệt cho Tấm Trang Trí MgO)**: Quản lý lớp phủ bề mặt (HPL, màng PVC, sơn chống cháy, in 3D).

---

## 1. MODEL 1: `ProductCore` (Thông tin sản phẩm chung)
*Áp dụng cho mọi dòng sản phẩm MgO (Vách, Trần, Sàn, SIP, Trang trí).*

| Tên Field | Kiểu dữ liệu | Ý nghĩa | Ví dụ dữ liệu thực tế |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID) | Khóa chính duy nhất | `"prod_mgo_standard_01"` |
| `name` | `string` | Tên thương mại sản phẩm | `"Tấm Chống Cháy Remak® FireOFF MgO"` |
| `slug` | `string` | URL thân thiện SEO | `"tam-chong-chay-remak-fireoff-mgo"` |
| `productType` | `enum` | **Khóa phân loại sản phẩm để gắn spec con** | `'STANDARD' \| 'SIP_PANEL' \| 'FLOOR' \| 'DECORATIVE' \| 'LITECORE'` |
| `category` | `enum` | Nhóm hạng mục thi công | `'wall' \| 'duct' \| 'floor' \| 'ceiling' \| 'facade'` |
| `tagline` | `string` | Slogan / Mô tả ngắn 1 câu | `"Vật liệu chống cháy thế hệ mới thay thế thạch cao"` |
| `description` | `string` | Bài viết giới thiệu chi tiết | Markdown / Rich HTML |
| `standardDimension` | `string` | Kích thước tiêu chuẩn chính | `"1220 x 2440 mm"` |
| `color` | `string` | Màu sắc cốt tấm | `"Trắng ngà" \| "Xám nhạt"` |
| `fireClass` | `string` | Cấp chống cháy vật liệu | `"Class A ASTM E84, Euroclass A1"` |
| `maxTemperature` | `number` | Nhiệt độ chịu nhiệt cực hạn | `2852` (°C) |
| `thermalConductivity`| `number` | Hệ số dẫn nhiệt ($\lambda$) | `0.169` (W/m·K) |
| `soundInsulation` | `string` | Khả năng giảm tiếng ồn | `"35 - 52 dB (giảm 45 dB)"` |
| `waterAbsorption` | `number` | Độ hấp thụ nước (ngâm 24h) | `< 15` (%) |
| `thicknessSwelling` | `number` | Độ trương nở bề dày | `< 0.08` (%) |
| `crystalPhase` | `string` | Cấu trúc tinh thể cốt lõi | `"Pha 517 (5Mg(OH)₂·MgSO₄·7H₂O)"` |
| `isAsbestosFree` | `boolean` | Không chứa amiăng | `true` |
| `formaldehydeEmission`| `string` | Phát thải Formaldehyde | `"0.0 mg/L (E0)"` |
| `applications` | `string[]` | Danh sách các ứng dụng phù hợp | `["Vách ngăn chống cháy", "Lõi cửa thép", "Ống gió PCCC"]` |
| `certifications` | `string[]` | Các chứng nhận đạt được | `["ASTM E84", "EN 13501-1", "UL 055", "LEED", "QCVN 06:2022"]` |
| `thumbnail` | `string` | Ảnh đại diện | `"/images/products/mgo-standard.webp"` |
| `gallery` | `string[]` | Bộ ảnh chi tiết / dự án | `["/img1.webp", "/img2.webp"]` |

---

## 2. MODEL 2: `ProductVariant` / `ProductThicknessSpec` (Biến thể theo độ dày)
*Một sản phẩm trong `ProductCore` sẽ có quan hệ **1 - Nhiều** với model này (Một loại tấm có các độ dày 5mm, 8mm, 10mm, 12mm, 15mm, 18mm).*

| Tên Field | Kiểu dữ liệu | Ý nghĩa | Ví dụ dữ liệu thực tế |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Khóa chính | `"var_5mm_01"` |
| `productId` | `string` (FK) | Liên kết tới `ProductCore.id` | `"prod_mgo_standard_01"` |
| `thickness` | `number` | Độ dày danh định (mm) | `5`, `8`, `10`, `12`, `15`, `18`, `20`, `22` |
| `thicknessUnit` | `string` | Đơn vị tính độ dày | `"mm"` |
| `weightPerSheet` | `number` | Trọng lượng trên 1 tấm chuẩn | `19.0`, `28.0`, `35.0`, `42.0`, `52.0` (kg/tấm) |
| `density` | `number` | Tỷ trọng thể tích | `963` (kg/m³) |
| `fireRating` | `string` | Giới hạn chịu lửa định danh | `"EI 30"`, `"EI 45 - EI 60"`, `"EI 90"`, `"EI 120"`, `"EI 180"` |
| `flexuralStrength` | `number` | Cường độ chịu uốn | `18`, `20`, `21`, `22`, `25` (MPa) |
| `recommendedUse` | `string` | Khuyến nghị ứng dụng tốt nhất | `"Bọc ống gió áp lực thấp, lõi cửa chống cháy"` |
| `price` | `number` | Đơn giá niêm yết (VNĐ) | `185000` (VNĐ/tấm) |
| `isPopular` | `boolean` | Độ dày bán chạy / phổ biến | `true \| false` |

---

## 3. MODEL 3: `SipPanelSpec` (Thuộc tính cho Tấm Sandwich SIP MgO)
*Chỉ kích hoạt khi `ProductCore.productType === 'SIP_PANEL'`. Liên kết 1 - 1 hoặc 1 - nhiều với sản phẩm SIP.*

| Tên Field | Kiểu dữ liệu | Ý nghĩa | Ví dụ dữ liệu thực tế |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Khóa chính | `"spec_sip_01"` |
| `productId` | `string` (FK) | Liên kết tới `ProductCore.id` | `"prod_mgo_sip_01"` |
| `coreMaterial` | `enum[]` | Các loại lõi cách nhiệt tương thích | `['EPS', 'XPS', 'PU', 'PIR', 'PHENOLIC']` |
| `coreThicknessMin` | `number` | Độ dày lõi tối thiểu | `50` (mm) |
| `coreThicknessMax` | `number` | Độ dày lõi tối đa | `200` (mm) hoặc tùy chỉnh |
| `facingBoardThickness`| `number[]` | Độ dày 2 tấm MgO ốp bề mặt | `[10, 12]` (mm) |
| `maxWidth` | `number` | Chiều rộng tối đa của panel | `1220` (mm) |
| `maxLength` | `number` | Chiều dài tối đa của panel | `3050` (mm) |
| `loadBearingType` | `string` | Khả năng chịu lực | `"Chịu lực kết cấu ngang và tải trọng đứng"` |
| `mainApplications` | `string[]` | Ứng dụng chuyên cho SIP | `["Kho lạnh", "Nhà lắp ghép Modular", "Vách xưởng"]` |

---

## 4. MODEL 4: `FloorBoardSpec` (Thuộc tính cho Tấm Sàn MgO Cao Cấp)
*Chỉ kích hoạt khi `ProductCore.productType === 'FLOOR'`.*

| Tên Field | Kiểu dữ liệu | Ý nghĩa | Ví dụ dữ liệu thực tế |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Khóa chính | `"spec_floor_01"` |
| `productId` | `string` (FK) | Liên kết tới `ProductCore.id` | `"prod_mgo_floor_01"` |
| `edgeProfile` | `enum` | Kiểu thiết kế hèm cạnh | `'TONGUE_AND_GROOVE' (Âm dương) \| 'SHIPLAP' (Gờ so le)` |
| `floorStandardSizes` | `string[]` | Các kích thước sàn tiêu chuẩn | `["2440 x 1220 mm", "2700 x 600 mm"]` |
| `floorDensity` | `string` | Tỷ trọng nén cao chuyên dụng | `"1200 – 1250 kg/m³"` |
| `floorFlexuralStrength`| `string` | Cường độ uốn chịu lực sàn | `"≥ 25 MPa"` |
| `surfaceTreatment` | `string` | Công nghệ xử lý mặt | `"Được chà nhám và làm phẳng bằng máy chuyên dụng"` |
| `suitableFlooring` | `string[]` | Tương thích vật liệu lót sàn | `["Sàn gỗ", "Gạch men", "Thảm", "Epoxy", "Vinyl"]` |
| `moistureResistantFloor`| `boolean`| Phù hợp sàn tầng hầm/ẩm ướt | `true` |

---

## 5. MODEL 5: `DecorativeFinishSpec` (Thuộc tính cho Tấm Trang Trí FireSafe)
*Chỉ kích hoạt khi `ProductCore.productType === 'DECORATIVE'`.*

| Tên Field | Kiểu dữ liệu | Ý nghĩa | Ví dụ dữ liệu thực tế |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Khóa chính | `"spec_decor_01"` |
| `productId` | `string` (FK) | Liên kết tới `ProductCore.id` | `"prod_mgo_firesafe_01"` |
| `finishType` | `enum` | Công nghệ hoàn thiện bề mặt | `'HPL' \| 'PVC_FILM' \| 'INTUMESCENT_PAINT' \| 'PRINT_3D'` |
| `finishName` | `string` | Tên gọi lớp phủ | `"Phủ Laminate HPL áp suất cao"` |
| `scratchResistance` | `string` | Khả năng chống trầy xước | `"Rất cao (HPL)" \| "Tiêu chuẩn"` |
| `patternOptions` | `string[]` | Tùy chọn hoa văn | `["Đơn sắc", "Vân gỗ sồi", "Vân đá marble", "Vân bê tông"]` |
| `custom3DPrintable` | `boolean` | Cho phép in tranh 3D theo yêu cầu | `true \| false` |
| `suitableAreas` | `string[]` | Không gian phù hợp | `["Sảnh lễ tân", "Phòng sạch", "Hành lang thoát hiểm"]` |

---

## TỔNG KẾT CODE TYPESCRIPT ĐỂ IMPORT DỰ ÁN

```typescript
// 1. Phân loại loại hình sản phẩm
export type ProductType = 'STANDARD' | 'SIP_PANEL' | 'FLOOR' | 'DECORATIVE' | 'LITECORE';

// 2. Model Gốc
export interface ProductCore {
  id: string;
  name: string;
  slug: string;
  productType: ProductType;
  category: 'wall' | 'duct' | 'floor' | 'ceiling' | 'facade';
  tagline: string;
  description: string;
  standardDimension: string;
  color: string;
  fireClass: string;
  maxTemperature: number;
  thermalConductivity: number;
  soundInsulation: string;
  waterAbsorption: number;
  thicknessSwelling: number;
  crystalPhase: string;
  isAsbestosFree: boolean;
  formaldehydeEmission: string;
  applications: string[];
  certifications: string[];
  thumbnail: string;
  gallery: string[];

  // Quan hệ: 1 Sản phẩm có nhiều biến thể độ dày
  variants?: ProductVariant[];

  // Quan hệ 1 - 1 với các Model thuộc tính chuyên biệt (tùy theo productType)
  sipSpec?: SipPanelSpec;
  floorSpec?: FloorBoardSpec;
  decorSpec?: DecorativeFinishSpec;
}

// 3. Model Biến thể theo độ dày
export interface ProductVariant {
  id: string;
  productId: string;
  thickness: number; // 5, 8, 10, 12, 15, 18, 20, 22
  thicknessUnit: string; // 'mm'
  weightPerSheet: number; // kg
  density: number; // kg/m³
  fireRating: string; // 'EI 30', 'EI 60', 'EI 120'...
  flexuralStrength: number; // MPa
  recommendedUse: string;
  price?: number;
  isPopular?: boolean;
}

// 4. Model Panel SIP
export interface SipPanelSpec {
  id: string;
  productId: string;
  coreMaterial: ('EPS' | 'XPS' | 'PU' | 'PIR' | 'PHENOLIC')[];
  coreThicknessMin: number; // mm
  coreThicknessMax: number; // mm
  facingBoardThickness: number[]; // [10, 12]
  maxWidth: number;
  maxLength: number;
  loadBearingType: string;
  mainApplications: string[];
}

// 5. Model Tấm Sàn
export interface FloorBoardSpec {
  id: string;
  productId: string;
  edgeProfile: 'TONGUE_AND_GROOVE' | 'SHIPLAP';
  floorStandardSizes: string[];
  floorDensity: string; // '1200 - 1250 kg/m³'
  floorFlexuralStrength: string; // '≥ 25 MPa'
  surfaceTreatment: string;
  suitableFlooring: string[];
  moistureResistantFloor: boolean;
}

// 6. Model Tấm Trang Trí
export interface DecorativeFinishSpec {
  id: string;
  productId: string;
  finishType: 'HPL' | 'PVC_FILM' | 'INTUMESCENT_PAINT' | 'PRINT_3D';
  finishName: string;
  scratchResistance: string;
  patternOptions: string[];
  custom3DPrintable: boolean;
  suitableAreas: string[];
}
```
