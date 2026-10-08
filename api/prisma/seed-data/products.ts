// Dữ liệu sản phẩm ban đầu — chép từ Catalogue Remak® FireOFF MgO (docs/catalog-mgo/01, 03_1 … 03_5).
// Quy tắc: chỉ ghi số có trong catalogue; không có thì để null (không bịa). Giá: catalogue không có -> "Liên hệ báo giá".
// Chỉ có bản tiếng Việt; bản tiếng Anh dịch sau trong CMS.

import type { DecorativeFinishType, EdgeProfile, ProductType, SipCoreMaterial } from '@remak/shared/contracts/product';

export interface SeedVariant {
  thicknessMm: number;
  widthMm?: number;
  lengthMm?: number;
  weightKg?: number;
  fireRatingMinMinutes?: number;
  fireRatingMaxMinutes?: number;
  fireRatingLabel?: string;
  flexuralMinMpa?: number;
  densityKgM3?: number;
  recommendedUse?: string;
  isPopular?: boolean;
  isDefault?: boolean;
}

export interface SeedProduct {
  key: string;
  productType: ProductType;
  tradeName: string;
  isFeatured?: boolean;
  vi: {
    name: string;
    shortName: string;
    slug: string;
    tagline: string;
    summary: string;
    description: string[];
    highlights: string[];
    advantages: { title: string; desc: string }[];
    seoTitle?: string;
    seoDescription?: string;
  };
  /** Cột TDS (camelCase như Prisma); thiếu = null */
  spec: Record<string, unknown>;
  variants: SeedVariant[];
  sip?: {
    coreMaterials: SipCoreMaterial[];
    coreThicknessMinMm: number;
    coreThicknessMaxMm: number;
    facingThicknessesMm: number[];
    maxWidthMm: number;
    maxLengthMm: number;
    loadBearing: string;
  };
  floor?: {
    edgeProfiles: EdgeProfile[];
    floorSizes: { widthMm: number; lengthMm: number }[];
    suitableFloorings: string[];
    moistureResistantFloor: boolean;
    sandedSurface: boolean;
  };
  decorative?: {
    customPrintSupported: boolean;
    options: { finishType: DecorativeFinishType; scratchResistance?: string; name: string; description: string; patterns?: string[]; suitableAreas: string[] }[];
  };
}

const SHEET = { widthMm: 1220, lengthMm: 2440 };

/** TDS chung tấm MgO (01_ve_remak_fireoff_mgo.md — bảng TDS) */
const BASE_TDS = {
  standardSizes: [SHEET],
  edgeProfile: 'SQUARE',
  coreColor: 'OFF_WHITE',
  surfaceFinish: 'SMOOTH',
  densityMinKgM3: 950,
  densityMaxKgM3: 1150,
  flexuralMinMpa: 15,
  flexuralMaxMpa: 25,
  flexuralCrossMinMpa: 10,
  screwHoldingRating: 'EXCELLENT',
  reactionToFireClass: 'A1',
  fireClassStandards: ['ASTM E84 (Class A)', 'EN 13501-1 (Euroclass A1)', 'UL 055'],
  maxTemperatureC: 2852,
  thermalConductivityWmk: 0.169,
  soundReductionMinDb: 35,
  soundReductionMaxDb: 52,
  waterAbsorptionMaxPct: 15,
  thicknessSwellingMaxPct: 0.08,
  moldResistant: true,
  crystalPhase: 'PHASE_517',
  mgoContentMinPct: 70,
  asbestosFree: true,
  formaldehydeMgL: 0,
  vocLevel: 'VERY_LOW',
  greenCertifications: ['LEED', 'GREEN STAR'],
};

export const PRODUCTS: SeedProduct[] = [
  {
    key: 'standard',
    productType: 'STANDARD',
    tradeName: 'Remak® FireOFF MgO',
    isFeatured: true,
    vi: {
      name: 'Tấm chống cháy Remak® FireOFF MgO',
      shortName: 'FireOFF MgO tiêu chuẩn',
      slug: 'tam-chong-chay-remak-fireoff-mgo',
      tagline: 'Vật liệu xây dựng xanh thế hệ mới thay thế thạch cao và tấm xi măng',
      summary:
        'Tấm MgO chịu nhiệt tới 2.852°C, đạt Class A (ASTM E84), Euroclass A1 và UL 055; chống ẩm, cách âm tới 45 dB, không amiăng. Độ dày 5–18 mm cho vách, trần, ống gió và sàn.',
      description: [
        'Tấm Remak® FireOFF MgO là vật liệu xây dựng xanh thế hệ mới, thay thế các loại tấm thạch cao và tấm xi măng truyền thống nhờ khả năng vượt trội về an toàn cháy nổ, cách âm, cách nhiệt, chống ẩm và chống mối mọt — được tối ưu hóa cho khí hậu nóng ẩm của Việt Nam.',
        'Tấm chứa hơn 70% Oxit Magie (MgO), kết hợp muối Magie Clorua, sợi gỗ cellulose, lưới sợi thủy tinh kháng kiềm, vải không dệt và cốt liệu khoáng.',
      ],
      highlights: ['Chịu nhiệt tới 2.852°C', 'Class A · Euroclass A1 · UL 055', 'Giảm ồn tới 45 dB (tấm 10–12 mm)', '100% không amiăng, E0'],
      advantages: [
        { title: 'Chống cháy', desc: 'Chịu được nhiệt độ lên tới 2.852°C mà không nứt hoặc biến dạng; không lan truyền ngọn lửa, không tạo khói độc.' },
        { title: 'Chống ẩm & nấm mốc', desc: 'Không phồng rộp, tách lớp hay phát sinh nấm mốc khi gặp ẩm hoặc tiếp xúc ngắn hạn với nước — phù hợp khí hậu nồm ẩm.' },
        { title: 'Cách âm', desc: 'Tấm dày 10–12 mm lắp đặt đúng kỹ thuật giảm tiếng ồn lên đến 45 dB.' },
        { title: 'An toàn & thân thiện môi trường', desc: '100% vật liệu tự nhiên; không chứa amiăng, formaldehyde, benzen, amoniac, silica; hỗ trợ đạt LEED và GREEN STAR.' },
      ],
      seoTitle: 'Tấm chống cháy MgO Remak® FireOFF 5–18mm | Class A, EI 30–180',
    },
    spec: BASE_TDS,
    variants: [
      { thicknessMm: 5, weightKg: 19, fireRatingMinMinutes: 30, fireRatingMaxMinutes: 30, fireRatingLabel: 'Euroclass A1, EI 30', flexuralMinMpa: 18, recommendedUse: 'Bọc ống gió áp lực thấp, lõi cửa thép chống cháy, trần treo chống ẩm' },
      { thicknessMm: 8, weightKg: 28, fireRatingMinMinutes: 45, fireRatingMaxMinutes: 60, fireRatingLabel: 'EI 45 – EI 60', flexuralMinMpa: 18, recommendedUse: 'Ống gió hút khói PCCC, vách ngăn phòng sạch, vách nhà xưởng', isDefault: true },
      { thicknessMm: 10, weightKg: 35, fireRatingMinMinutes: 60, fireRatingMaxMinutes: 90, fireRatingLabel: 'EI 60 – EI 90', flexuralMinMpa: 20, recommendedUse: 'Vách ngăn cách âm chống cháy, ống gió cao tầng, vách thoát hiểm', isPopular: true },
      { thicknessMm: 12, weightKg: 42, fireRatingMinMinutes: 120, fireRatingMaxMinutes: 150, fireRatingLabel: 'EI 120 – EI 150', flexuralMinMpa: 21, recommendedUse: 'Vách chống cháy phân xưởng, bọc dầm cột thép, trạm biến áp', isPopular: true },
      { thicknessMm: 15, weightKg: 52, fireRatingMinMinutes: 180, fireRatingMaxMinutes: 180, fireRatingLabel: 'EI 180 (chịu lửa 3h)', flexuralMinMpa: 22, recommendedUse: 'Lót sàn gác lửng chịu lực, vách kho hóa chất, chống va đập nặng' },
      { thicknessMm: 18, weightKg: 62, fireRatingMinMinutes: 180, fireRatingMaxMinutes: 180, fireRatingLabel: 'EI 180+', flexuralMinMpa: 25, recommendedUse: 'Sàn chịu tải nặng, sàn nhà xưởng, tấm sàn kỹ thuật' },
    ],
  },
  {
    key: 'sip',
    productType: 'SIP_PANEL',
    tradeName: 'Remak® FireOFF SIP MgO',
    vi: {
      name: 'Panel SIP MgO cách nhiệt chống cháy',
      shortName: 'Panel SIP MgO',
      slug: 'panel-sip-mgo',
      tagline: 'Hệ panel cách nhiệt tích hợp chịu lực cho tường, mái và sàn',
      summary:
        'Panel SIP sản xuất đồng bộ tại nhà máy: 2 mặt tấm MgO 10–12 mm kết hợp lõi EPS, XPS, PU, PIR hoặc Phenolic dày 50–200 mm+, dài tới 3.050 mm+.',
      description: [
        'Giải pháp SIP (Structural Insulated Panel) sử dụng tấm MgO kết hợp cùng lõi vật liệu cách nhiệt hiệu suất cao như EPS, XPS, PU, PIR hoặc Foam Phenolic.',
        'Hệ panel được sản xuất đồng bộ tại nhà máy, tích hợp trong một cấu kiện duy nhất, mang lại khả năng chịu lực vượt trội, hiệu quả cách nhiệt cao và tốc độ thi công nhanh — giải pháp hoàn chỉnh cho tường, mái và sàn.',
      ],
      highlights: ['Lõi EPS / XPS / PU / PIR / Phenolic', 'Lõi dày 50–200 mm+', 'Dài tới 3.050 mm+', 'Lớp bảo vệ chống cháy liên tục'],
      advantages: [
        { title: 'Tăng khả năng chịu lực kết cấu', desc: 'Bề mặt MgO mật độ cao tăng chịu lực ngang và tải dọc, cho phép khẩu độ lớn hơn và giảm khung kết cấu phụ.' },
        { title: 'Lớp bảo vệ chống cháy tự nhiên', desc: 'Lớp MgO không bắt cháy bao liên tục, nâng khả năng chống cháy tổng thể của công trình.' },
        { title: 'Kiểm soát ẩm hiệu quả', desc: 'Chống nấm mốc và ẩm tự nhiên, bảo vệ lõi cách nhiệt khỏi suy giảm theo thời gian.' },
        { title: 'Bề mặt hoàn thiện lý tưởng', desc: 'Sơn, tạo vân hoặc ốp phủ mỏng trực tiếp mà không cần nhiều công đoạn xử lý.' },
        { title: 'Bền bỉ, chống côn trùng', desc: 'Không mục, không ăn mòn, không bị mối mọt; gần như không cần bảo trì.' },
      ],
    },
    spec: { ...BASE_TDS, standardSizes: [SHEET] },
    variants: [],
    sip: {
      coreMaterials: ['EPS', 'XPS', 'PU', 'PIR', 'PHENOLIC'],
      coreThicknessMinMm: 50,
      coreThicknessMaxMm: 200,
      facingThicknessesMm: [10, 12],
      maxWidthMm: 1220,
      maxLengthMm: 3050,
      loadBearing: 'STRUCTURAL',
    },
  },
  {
    key: 'litecore',
    productType: 'LITECORE',
    tradeName: 'LiteCore™ MgO Composite Board',
    vi: {
      name: 'Tấm composite MgO LiteCore™ siêu nhẹ',
      shortName: 'LiteCore™',
      slug: 'tam-composite-mgo-litecore',
      tagline: 'Nhẹ hơn ~70%, lắp đặt nhanh gấp 5 lần, chống cháy Class A',
      summary:
        'Ma trận MgO chịu nhiệt tích hợp hạt EPS siêu nhẹ: nhẹ hơn khoảng 70% so với tấm xi măng / thạch cao, độ dày 6–15 mm, đạt Class A (ASTM E84 / Euroclass A1).',
      description: [
        'LiteCore™ MgO Composite Board tích hợp các hạt EPS vào nền vật liệu MgO hiệu suất cao, kết hợp trọng lượng siêu nhẹ, độ bền kết cấu và khả năng chống cháy vượt trội.',
        'Giải pháp giúp đẩy nhanh tiến độ thi công, tối ưu chi phí và hỗ trợ các tiêu chuẩn xây dựng bền vững.',
      ],
      highlights: ['Nhẹ hơn ~70%', 'Lắp đặt nhanh gấp 5 lần', 'Tiết kiệm đến 30% nhân công', 'Class A (ASTM E84 / Euroclass A1)'],
      advantages: [
        { title: 'Trọng lượng siêu nhẹ', desc: 'Nhẹ hơn khoảng 70% so với tấm thông thường, giảm tải khung móng, dễ vận chuyển và lắp trên cao.' },
        { title: 'Độ bền trong kết cấu nhẹ', desc: 'Công nghệ composite giữ độ cứng cao và bám vít tốt, hiệu suất ổn định nhiều năm.' },
        { title: 'An toàn cháy nổ Class A', desc: 'Lớp ma trận MgO bao quanh bảo vệ lõi EPS, vẫn cách nhiệt mà an toàn chống cháy.' },
        { title: 'Tăng tốc tiến độ', desc: 'Lắp ghép nhanh gấp 5 lần, tiết kiệm đến 30% ngân sách nhân công.' },
      ],
    },
    // Catalogue LiteCore không ghi tỷ trọng tuyệt đối / cường độ uốn / cách âm -> để null, chỉ ghi mức giảm tỷ trọng
    spec: {
      standardSizes: [SHEET],
      edgeProfile: 'SQUARE',
      screwHoldingRating: 'EXCELLENT',
      densityReductionPct: 70,
      reactionToFireClass: 'A1',
      fireClassStandards: ['ASTM E84 (Class A)', 'EN 13501-1 (Euroclass A1)'],
      moldResistant: true,
      asbestosFree: true,
      vocLevel: 'VERY_LOW',
      greenCertifications: ['LEED'],
    },
    variants: [{ thicknessMm: 6 }, { thicknessMm: 8 }, { thicknessMm: 10, isDefault: true }, { thicknessMm: 12 }, { thicknessMm: 15 }],
  },
  {
    key: 'floor',
    productType: 'FLOOR',
    tradeName: 'Remak® FireOFF MgO Floor',
    vi: {
      name: 'Tấm sàn MgO cao cấp bề mặt chà nhám',
      shortName: 'Tấm sàn MgO',
      slug: 'tam-san-mgo-cha-nham',
      tagline: 'Tấm sàn mật độ cao hèm âm dương, chịu uốn ≥ 25 MPa',
      summary:
        'Tấm sàn MgO tỷ trọng 1.200–1.250 kg/m³, dày 16–22 mm, cạnh âm dương (T&G) hoặc Shiplap, mặt chà nhám phẳng; tương thích sàn gỗ, gạch, thảm, epoxy, vinyl.',
      description: [
        'Tấm sàn MgO mật độ cao được gia công chính xác với hệ cạnh Âm Dương (Tongue & Groove) hoặc Shiplap, mang đến độ phẳng tối ưu, khả năng chịu lực vượt trội và chống ẩm bền vững.',
        'Giải pháp cho hệ sàn dân dụng, thương mại và công nghiệp; tấm nền cho sàn nâng kỹ thuật (data center) và lớp phủ cân bằng khi cải tạo sàn.',
      ],
      highlights: ['Cường độ uốn ≥ 25 MPa', 'Tỷ trọng 1.200–1.250 kg/m³', 'Cạnh T&G / Shiplap', 'Mặt chà nhám phẳng'],
      advantages: [
        { title: 'Độ phẳng vượt trội', desc: 'Độ dày kiểm soát từng milimet, tương thích sàn gỗ, gạch men, thảm, epoxy, vinyl.' },
        { title: 'Cường độ cao, bền lâu', desc: 'Tỷ trọng cao chịu tải lớn, chống va đập, không võng hay co ngót theo thời gian.' },
        { title: 'Hệ khóa âm dương ổn định', desc: 'Cạnh gia công tự động, ghép nối nhanh, khít, mặt sàn liền mạch.' },
        { title: 'Chống ẩm & nấm mốc', desc: 'Phù hợp tầng hầm, phòng kỹ thuật, nhà bếp và nơi ẩm cao.' },
        { title: 'Chống cháy Class A', desc: 'Lớp bảo vệ chống cháy thụ động theo ASTM E84 và Euroclass A.' },
        { title: 'An toàn môi trường', desc: '100% không amiăng, phát thải VOC cực thấp.' },
      ],
    },
    spec: {
      ...BASE_TDS,
      standardSizes: [SHEET, { widthMm: 600, lengthMm: 2700 }],
      edgeProfile: 'TONGUE_GROOVE',
      surfaceFinish: 'SANDED',
      densityMinKgM3: 1200,
      densityMaxKgM3: 1250,
      flexuralMinMpa: 25,
      flexuralMaxMpa: null,
      flexuralCrossMinMpa: null,
      // Catalogue tấm sàn không ghi các chỉ tiêu này riêng cho sàn -> null
      maxTemperatureC: null,
      thermalConductivityWmk: null,
      soundReductionMinDb: null,
      soundReductionMaxDb: null,
      waterAbsorptionMaxPct: null,
      thicknessSwellingMaxPct: null,
      mgoContentMinPct: null,
    },
    variants: [{ thicknessMm: 16 }, { thicknessMm: 18, isDefault: true }, { thicknessMm: 19 }, { thicknessMm: 20 }, { thicknessMm: 22 }],
    floor: {
      edgeProfiles: ['TONGUE_GROOVE', 'SHIPLAP'],
      floorSizes: [SHEET, { widthMm: 600, lengthMm: 2700 }],
      suitableFloorings: ['WOOD', 'TILE', 'CARPET', 'EPOXY', 'VINYL'],
      moistureResistantFloor: true,
      sandedSurface: true,
    },
  },
  {
    key: 'decorative',
    productType: 'DECORATIVE',
    tradeName: 'Remak® FireSafe Finishes',
    vi: {
      name: 'Tấm trang trí MgO FireSafe',
      shortName: 'FireSafe Finishes',
      slug: 'tam-trang-tri-mgo-firesafe',
      tagline: 'Thẩm mỹ cao cấp trên lõi MgO không bắt cháy Class A',
      summary:
        'Tấm trang trí nền MgO với 4 lớp hoàn thiện: Laminate HPL, màng PVC, sơn trương nở chống cháy và in 3D theo thiết kế — cho khách sạn, bệnh viện, trường học, công trình công cộng.',
      description: [
        'Ở những không gian mà thẩm mỹ và an toàn công cộng đều quan trọng, vật liệu trang trí thông thường (MDF/HDF, nhựa PVC) dễ bắt lửa và sinh khói độc.',
        'Tấm trang trí nền MgO cung cấp đa dạng màu sắc, hoa văn, kết cấu bề mặt trên lõi MgO không bắt cháy đạt Class A — loại bỏ sự đánh đổi giữa thẩm mỹ và an toàn cháy nổ.',
      ],
      highlights: ['4 lớp hoàn thiện có sẵn', 'Lõi MgO Class A', 'In 3D theo thiết kế riêng'],
      advantages: [],
    },
    spec: { ...BASE_TDS, surfaceFinish: 'HPL' },
    variants: [],
    decorative: {
      customPrintSupported: true,
      options: [
        {
          finishType: 'HPL',
          scratchResistance: 'VERY_HIGH',
          name: 'Phủ Laminate áp suất cao (HPL)',
          description: 'Lớp laminate HPL chịu lực, chống trầy xước, chống va đập, chịu hóa chất tẩy rửa tốt.',
          patterns: ['Đơn sắc pastel', 'Vân gỗ sồi', 'Vân óc chó', 'Hoa văn đá / vải nghệ thuật'],
          suitableAreas: ['Ốp tường sảnh', 'Vách ngăn nội thất', 'Mặt bàn, tủ kệ thương mại và văn phòng'],
        },
        {
          finishType: 'PVC_FILM',
          scratchResistance: 'STANDARD',
          name: 'Phủ màng PVC',
          description: 'Giải pháp kinh tế, bề mặt trơn láng liền mạch, chống thấm nước bề mặt.',
          suitableAreas: ['Nội thất mô-đun', 'Gian hàng trưng bày', 'Quầy kệ', 'Vách ngăn phòng sạch'],
        },
        {
          finishType: 'INTUMESCENT_PAINT',
          name: 'Sơn trương nở & lớp phủ chống cháy',
          description: 'Sơn trương nở nhiệt phun công nghiệp, gia tăng giới hạn chịu lửa và tạo bề mặt sơn mịn đồng nhất.',
          suitableAreas: ['Cấu kiện lộ thiên', 'Hành lang thoát hiểm', 'Trục thang bộ', 'Khu vực kỹ thuật'],
        },
        {
          finishType: 'PRINT_3D',
          name: 'Bề mặt in 3D theo thiết kế riêng',
          description: 'In kỹ thuật số 3D độ phân giải cao: tranh nghệ thuật, họa tiết, hiệu ứng vân đá nổi khối.',
          suitableAreas: ['Vách điểm nhấn', 'Sảnh tập đoàn', 'Không gian nhận diện thương hiệu'],
        },
      ],
    },
  },
  {
    key: 'custom',
    productType: 'CUSTOM',
    tradeName: 'Remak® FireOFF MgO Custom',
    vi: {
      name: 'Tấm MgO gia công tuỳ chỉnh theo dự án',
      shortName: 'MgO tuỳ chỉnh',
      slug: 'tam-mgo-tuy-chinh',
      tagline: 'Thiết kế khuôn, cắt CNC, hoa văn và độ dày theo bản vẽ dự án',
      summary:
        'Remak nghiên cứu, thiết kế khuôn và gia công tấm MgO theo bản vẽ: tấm ốp định hình, hoa văn 3D, sàn nổi phủ Laminate, rãnh chữ V, dày 25 mm+, phối ceramsite, màu xám bê tông.',
      description: [
        'Thế mạnh cốt lõi của Remak là khả năng nghiên cứu, thiết kế khuôn và gia công tấm MgO theo chính xác bản vẽ và yêu cầu kỹ thuật của từng dự án — từ hoa văn phức tạp, rãnh chỉ kiến trúc đến cắt CNC kích thước chuyên biệt.',
      ],
      highlights: ['Gia công theo bản vẽ', 'Cắt CNC', 'Dày 25 mm+'],
      advantages: [
        { title: 'Tấm ốp tường MgO định hình', desc: 'Thiết kế chuyên biệt cho hệ vách ốp ngoài trời hoặc tường bao che.' },
        { title: 'Tấm MgO hoa văn đặc biệt', desc: 'Bề mặt dập nổi vân hình học, lượn sóng hoặc họa tiết 3D.' },
        { title: 'Tấm sàn nổi MgO phủ Laminate', desc: 'Module hoàn thiện mặt cho sàn nâng kỹ thuật văn phòng và trung tâm dữ liệu.' },
        { title: 'Cạnh rãnh chữ V (V-Groove)', desc: 'Tạo khe rãnh trang trí trên tường nội thất không cần nẹp chỉ.' },
        { title: 'Dày 25 mm+ (Extra Heavy Duty)', desc: 'Chịu tải trọng nặng, cách âm và chống cháy cường độ cao.' },
        { title: 'Phối hạt Ceramsite', desc: 'Hạt khoáng xốp nhẹ tối ưu tỷ trọng, tăng cách âm và cản nhiệt.' },
        { title: 'Màu xám trang trí', desc: 'Hiệu ứng bê tông mộc cho phong cách Industrial / Minimalism.' },
        { title: 'Hoa văn, nhám thô, vân đá', desc: 'Tùy chỉnh theo catalogue mẫu của chủ đầu tư.' },
      ],
    },
    spec: { reactionToFireClass: 'A1', asbestosFree: true },
    variants: [],
  },
];
