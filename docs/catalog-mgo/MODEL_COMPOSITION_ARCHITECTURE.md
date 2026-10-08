# KIẾN TRÚC CLASS MODEL THEO THIẾT KẾ COMPOSITION (SCALE-UP ARCHITECTURE)

> **Mục tiêu**: 
> 1. Sử dụng Model gốc mang tên **`Product`** (thay cho `ProductItem`) làm Single Source of Truth cho toàn bộ hệ thống (Website & CMS).
> 2. Chia nhỏ thành các **Sub-Model / Value Object (Class con)** độc lập theo từng nhóm nghiệp vụ chuyên biệt.
> 3. Vẫn đảm bảo **so sánh chéo** giữa các sản phẩm cực kỳ dễ dàng thông qua các **Method so sánh** được tích hợp ngay trong từng Class con.

---

## 1. SƠ ĐỒ CẤU TRÚC COMPOSITION (TỔ HỢP)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Product (Root Model)                          │
│                                                                        │
│  - id, slug, name, tradeMark, category                                 │
│  - pricing: ProductPricing (Giá bán, khuyến mãi, tính giá m2)          │
│  - physical: PhysicalDimensions (Kích thước, độ dày, hèm cạnh, màu)    │
│  - mechanical: MechanicalSpecs (Cường độ uốn, tỷ trọng, chịu tải)      │
│  - thermalFire: ThermalFireSpecs (Chịu nhiệt 2852°C, dẫn nhiệt, EI)    │
│  - acousticMoisture: AcousticMoistureSpecs (Cách âm 45dB, hút nước)    │
│  - chemistrySafety: ChemistrySafetySpecs (Pha 517, Zero-Chloride)      │
│  - extension: SipExtension | LiteCoreExtension | DecorativeExtension   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴──────────────────────────────┐
    ▼                                                              ▼
Method: compareWith(otherProduct)                 Method: calculateComparisonScore()
-> So sánh cơ lý, nhiệt học, âm học              -> Chấm điểm hơn/kém phục vụ nghiệp vụ
```

---

## 2. CHI TIẾT CÁC SUB-MODEL (CLASS CON ĐỘC LẬP)

### Class 1: `PhysicalDimensions` (Quy cách hình học & Ngoại quan)
*Phụ trách: Kích thước, độ dày, kiểu cạnh khóa, hoàn thiện mặt.*

```typescript
export class PhysicalDimensions {
  standardDimension: string;   // '1220 x 2440 mm' hoặc '2440 x 1220 mm / 2700 x 600 mm'
  thicknessList: string[];      // ['5mm', '8mm', '10mm', ...]
  edgeProfile: 'square' | 'tongue_groove' | 'shiplap' | 'v_groove';
  surfaceFinish: string;        // 'Nhẵn phẳng' | 'Chà nhám' | 'Phủ HPL' | 'Màng PVC'
  color: string;                // 'Trắng ngà' | 'Xám nhạt'

  constructor(data: Partial<PhysicalDimensions>) {
    this.standardDimension = data.standardDimension || '1220 x 2440 mm';
    this.thicknessList = data.thicknessList || [];
    this.edgeProfile = data.edgeProfile || 'square';
    this.surfaceFinish = data.surfaceFinish || 'Bề mặt nhẵn phẳng';
    this.color = data.color || 'Trắng ngà';
  }

  // Nghiệp vụ: Kiểm tra có hỗ trợ độ dày này không
  hasThickness(thickness: string): boolean {
    return this.thicknessList.includes(thickness);
  }

  // Nghiệp vụ: Kiểm tra hèm khóa sàn
  isInterlocking(): boolean {
    return this.edgeProfile === 'tongue_groove' || this.edgeProfile === 'shiplap';
  }
}
```

---

### Class 2: `MechanicalSpecs` (Thông số cơ lý & Chịu tải)
*Phụ trách: Cường độ uốn, tỷ trọng, tải trọng cho phép.*

```typescript
export class MechanicalSpecs {
  density: string;             // '963 kg/m³' | '1200 - 1250 kg/m³'
  densityValue: number;        // 963 | 1250
  flexuralStrength: string;    // '18 - 22 MPa' | '≥ 25 MPa'
  flexuralValue: number;       // 18 | 25 (MPa)
  screwHolding: string;        // 'Xuất sắc'

  constructor(data: Partial<MechanicalSpecs>) {
    this.density = data.density || '963 kg/m³';
    this.densityValue = data.densityValue || 963;
    this.flexuralStrength = data.flexuralStrength || '18 MPa';
    this.flexuralValue = data.flexuralValue || 18;
    this.screwHolding = data.screwHolding || 'Xuất sắc';
  }

  // Nghiệp vụ: So sánh cường độ uốn với sản phẩm khác
  compareFlexuralWith(other: MechanicalSpecs): 'stronger' | 'weaker' | 'equal' {
    if (this.flexuralValue > other.flexuralValue) return 'stronger';
    if (this.flexuralValue < other.flexuralValue) return 'weaker';
    return 'equal';
  }

  // Nghiệp vụ: So sánh độ nhẹ (giảm tải)
  isLighterThan(other: MechanicalSpecs): boolean {
    return this.densityValue < other.densityValue;
  }
}
```

---

### Class 3: `ThermalFireSpecs` (Nhiệt học & Phòng cháy PCCC)
*Phụ trách: Chịu nhiệt độ cực hạn, dẫn nhiệt, giới hạn EI.*

```typescript
export class ThermalFireSpecs {
  fireRating: string;          // 'Class A1 / EI 60 – EI 150'
  fireLimitMinutes: number;    // 30, 60, 90, 120, 180 (phút)
  maxTemperature: number;      // 2852 (°C)
  thermalConductivity: number; // 0.169 (W/m·K)

  constructor(data: Partial<ThermalFireSpecs>) {
    this.fireRating = data.fireRating || 'Class A1 / ASTM E84';
    this.fireLimitMinutes = data.fireLimitMinutes || 60;
    this.maxTemperature = data.maxTemperature || 2852;
    this.thermalConductivity = data.thermalConductivity || 0.169;
  }

  // Nghiệp vụ: So sánh cấp chịu lửa
  compareFireMinutes(other: ThermalFireSpecs): number {
    return this.fireLimitMinutes - other.fireLimitMinutes;
  }

  // Nghiệp vụ: Kiểm tra có đạt nghiệm thu EI mục tiêu không
  meetsTargetEI(targetMinutes: number): boolean {
    return this.fireLimitMinutes >= targetMinutes;
  }
}
```

---

### Class 4: `AcousticMoistureSpecs` (Âm học & Kháng ẩm)
*Phụ trách: Giảm ồn dB, độ hút nước, độ nở bề dày.*

```typescript
export class AcousticMoistureSpecs {
  soundReductionDb: number;    // 45 (dB)
  soundRatingText: string;     // '35 - 52 dB (giảm ồn 45 dB với tấm 10-12mm)'
  waterAbsorptionRate: number; // 15 (< 15%)
  thicknessSwelling: number;   // 0.08 (< 0.08%)

  constructor(data: Partial<AcousticMoistureSpecs>) {
    this.soundReductionDb = data.soundReductionDb || 45;
    this.soundRatingText = data.soundRatingText || 'Giảm ồn lên đến 45 dB';
    this.waterAbsorptionRate = data.waterAbsorptionRate || 14.5;
    this.thicknessSwelling = data.thicknessSwelling || 0.05;
  }

  // Nghiệp vụ: So sánh khả năng cách âm
  compareSoundInsulation(other: AcousticMoistureSpecs): number {
    return this.soundReductionDb - other.soundReductionDb;
  }
}
```

---

### Class 5: `ChemistrySafetySpecs` (Hóa học, Môi trường & Độ bền)
*Phụ trách: Cấu trúc pha 517, Zero-Chloride chống gỉ đinh vít, phát thải E0.*

```typescript
export class ChemistrySafetySpecs {
  crystalPhase: string;        // 'Pha tinh thể 517 (5Mg(OH)₂·MgSO₄·7H₂O)'
  chloridePercent: number;     // 0.01 (Zero-Chloride) hoặc 0.04
  asbestosFree: boolean;       // true (100% không amiăng)
  formaldehydeLevel: string;   // '0.0 mg/L (Chuẩn E0)'

  constructor(data: Partial<ChemistrySafetySpecs>) {
    this.crystalPhase = data.crystalPhase || 'Pha tinh thể 517';
    this.chloridePercent = data.chloridePercent || 0.01;
    this.asbestosFree = true;
    this.formaldehydeLevel = '0.0 mg/L (E0)';
  }

  // Nghiệp vụ: Đánh giá an toàn khung thép & đinh vít
  isCorrosionProof(): boolean {
    return this.chloridePercent <= 0.02;
  }
}
```

---

### Class 6: `ProductExtension` (Mở rộng chuyên biệt dạng Polymorphism)

```typescript
// Mở rộng cho SIP
export interface SipExtension {
  type: 'SIP';
  coreMaterials: ('EPS' | 'XPS' | 'PU' | 'PIR' | 'Phenolic')[];
  coreThicknessRange: string;  // '50mm – 200mm+'
  facingBoardThickness: number[]; // [10, 12] (mm)
  maxPanelLength: number;      // 3050 (mm)
}

// Mở rộng cho LiteCore™ siêu nhẹ
export interface LiteCoreExtension {
  type: 'LITECORE';
  weightReductionPercent: number; // 70 (%)
  installationSpeedFactor: number;// 5 (gấp 5 lần)
  laborCostSavingsPercent: number;// 30 (%)
}

// Mở rộng cho Tấm Trang Trí FireSafe
export interface DecorativeExtension {
  type: 'DECORATIVE';
  finishCategory: 'HPL' | 'PVC_FILM' | 'INTUMESCENT_PAINT' | 'PRINT_3D';
  customPrintSupported: boolean;
}

export type ProductExtension = SipExtension | LiteCoreExtension | DecorativeExtension | null;
```

---

## 3. ROOT CLASS: `Product` (Tổ hợp toàn diện)

```typescript
export class Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tradeMark: string;
  category: 'wall' | 'floor' | 'duct' | 'sip' | 'litecore' | 'decorative' | 'acoustic';
  tagline: string;
  description: string;
  image: string;
  galleryImages: string[];
  testedStandards: string[];
  basePrice?: number;
  originalPrice?: number;
  isPopular?: boolean;
  isBestSeller?: boolean;

  // Tổ hợp các sub-models con:
  physical: PhysicalDimensions;
  mechanical: MechanicalSpecs;
  thermalFire: ThermalFireSpecs;
  acousticMoisture: AcousticMoistureSpecs;
  chemistrySafety: ChemistrySafetySpecs;
  extension: ProductExtension;

  constructor(data: any) {
    this.id = data.id;
    this.slug = data.slug;
    this.name = data.name;
    this.shortName = data.shortName;
    this.tradeMark = data.tradeMark;
    this.category = data.category;
    this.tagline = data.tagline;
    this.description = data.description;
    this.image = data.image;
    this.galleryImages = data.galleryImages || [];
    this.testedStandards = data.testedStandards || [];
    this.basePrice = data.basePrice;
    this.originalPrice = data.originalPrice;
    this.isPopular = data.isPopular;
    this.isBestSeller = data.isBestSeller;

    // Khởi tạo các sub-models con
    this.physical = new PhysicalDimensions(data.physical || {});
    this.mechanical = new MechanicalSpecs(data.mechanical || {});
    this.thermalFire = new ThermalFireSpecs(data.thermalFire || {});
    this.acousticMoisture = new AcousticMoistureSpecs(data.acousticMoisture || {});
    this.chemistrySafety = new ChemistrySafetySpecs(data.chemistrySafety || {});
    this.extension = data.extension || null;
  }

  // ==========================================
  // LOGIC NGHIỆP VỤ SO SÁNH (SCALE VÔ HẠN)
  // ==========================================
  compareWith(other: Product) {
    return {
      fireRatingComparison: this.thermalFire.compareFireMinutes(other.thermalFire),
      flexuralComparison: this.mechanical.compareFlexuralWith(other.mechanical),
      soundComparisonDb: this.acousticMoisture.compareSoundInsulation(other.acousticMoisture),
      isLighter: this.mechanical.isLighterThan(other.mechanical),
      corrosionSafety: {
        thisProduct: this.chemistrySafety.isCorrosionProof(),
        otherProduct: other.chemistrySafety.isCorrosionProof(),
      },
    };
  }
}
```
