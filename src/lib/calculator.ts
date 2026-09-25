/**
 * Thuật toán bóc tách và dự toán vật tư Tấm MGO Remak®
 */

export interface CalculationResult {
  sheetArea: number;       // Diện tích 1 tấm chuẩn (1.22m x 2.44m = 2.9768 m2)
  rawSheets: number;       // Số tấm lý thuyết
  totalSheets: number;     // Số tấm thực tế (+5% hao hụt thi công)
  estWeightKg: number;     // Tổng khối lượng ước tính (kg)
  estScrews: number;       // Ước tính số đinh vít chuyên dụng (30 vít/tấm)
  estTapeRolls: number;    // Ước tính cuộn lưới thủy tinh xử lý mối nối (~30m2/cuộn)
}

const WEIGHT_MAP: Record<number, number> = {
  5: 15.5,
  6: 18.5,
  8: 25.0,
  10: 31.0,
  12: 37.0,
  15: 46.5,
  18: 56.0,
};

export function calculateMgoMaterials(areaM2: number, thicknessMm: number): CalculationResult {
  const safeArea = Math.max(1, areaM2);
  const sheetArea = 1.22 * 2.44; // ~2.977 m2
  const rawSheets = safeArea / sheetArea;
  const totalSheets = Math.ceil(rawSheets * 1.05); // Cộng 5% hao hụt cắt góc
  const weightPerSheet = WEIGHT_MAP[thicknessMm] || (thicknessMm * 3.1);
  const estWeightKg = Math.round(totalSheets * weightPerSheet);
  const estScrews = totalSheets * 30;
  const estTapeRolls = Math.ceil(safeArea / 30);

  return {
    sheetArea,
    rawSheets,
    totalSheets,
    estWeightKg,
    estScrews,
    estTapeRolls,
  };
}
