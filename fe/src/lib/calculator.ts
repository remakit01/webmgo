/**
 * Thuật toán bóc tách và dự toán vật tư Tấm MGO Remak®
 */

export interface CalculationResult {
  sheetArea: number;       // Diện tích 1 tấm chuẩn (1.22m x 2.44m = 2.9768 m2)
  rawSheets: number;       // Số tấm lý thuyết
  totalSheets: number;     // Số tấm thực tế (+5% hao hụt thi công)
  sheets: number;          // Alias cho totalSheets
  frames: number;          // Số thanh khung xương ước tính
  screws: number;          // Số vít tự khoan mạ chống rỉ
  sealantTubes: number;    // Số tuýp keo chống cháy nở phồng
  meshRolls: number;       // Số cuộn lưới thủy tinh chống nứt
  estimatedCost: number;   // Tổng chi phí vật tư ước tính (VND)
  estWeightKg: number;     // Tổng khối lượng ước tính (kg)
  estScrews: number;       // Ước tính số đinh vít chuyên dụng
  estTapeRolls: number;    // Ước tính cuộn lưới thủy tinh xử lý mối nối
}

const WEIGHT_MAP: Record<number, number> = {
  5: 19.0,
  6: 22.0,
  8: 28.0,
  10: 35.0,
  12: 42.0,
  15: 52.0,
  18: 62.0,
};

// Đơn giá tham khảo theo độ dày tấm MGO (VND/tấm)
const PRICE_MAP: Record<number, number> = {
  5: 125000,
  6: 155000,
  8: 195000,
  10: 245000,
  12: 295000,
  15: 385000,
  18: 480000,
};

export function calculateMgoMaterials(areaM2: number, thicknessMm: number): CalculationResult {
  const safeArea = Math.max(1, areaM2);
  const sheetArea = 1.22 * 2.44; // ~2.977 m2
  const rawSheets = safeArea / sheetArea;
  const totalSheets = Math.ceil(rawSheets * 1.05); // Cộng 5% hao hụt cắt góc
  const weightPerSheet = WEIGHT_MAP[thicknessMm] || (thicknessMm * 3.5);
  const estWeightKg = Math.round(totalSheets * weightPerSheet);
  
  const estScrews = totalSheets * 30;
  const frames = Math.ceil(totalSheets * 1.5);
  const sealantTubes = Math.max(1, Math.ceil(totalSheets * 0.4));
  const meshRolls = Math.max(1, Math.ceil(safeArea / 30));
  
  // Tính tổng chi phí ước tính (Tấm MGO + phụ kiện cơ bản)
  const sheetPrice = PRICE_MAP[thicknessMm] || 250000;
  const estimatedCost = (totalSheets * sheetPrice) + (frames * 45000) + (estScrews * 250) + (sealantTubes * 85000);

  return {
    sheetArea,
    rawSheets,
    totalSheets,
    sheets: totalSheets,
    frames,
    screws: estScrews,
    sealantTubes,
    meshRolls,
    estimatedCost,
    estWeightKg,
    estScrews,
    estTapeRolls: meshRolls,
  };
}
