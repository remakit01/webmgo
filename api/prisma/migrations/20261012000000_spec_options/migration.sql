-- Danh mục thông số: 11 danh sách giá trị (kiểu cạnh, màu lõi, bề mặt, bám vít, pha tinh thể, VOC, lớp phủ sàn,
-- vật liệu lõi SIP, chịu lực, loại hoàn thiện, chống trầy) chuyển từ hằng số trong code + 3 enum Postgres sang bảng
-- spec_options (quản lý trong CMS). Cột sản phẩm vẫn lưu MÃ như cũ -> chỉ đổi kiểu enum sang text, KHÔNG đổi dữ liệu.

BEGIN;

-- CreateEnum
CREATE TYPE "spec_option_group" AS ENUM ('EDGE_PROFILE', 'CORE_COLOR', 'SURFACE_FINISH', 'SCREW_HOLDING', 'CRYSTAL_PHASE', 'VOC_LEVEL', 'SUITABLE_FLOORING', 'SIP_CORE_MATERIAL', 'LOAD_BEARING', 'DECORATIVE_FINISH', 'SCRATCH_RESISTANCE');

-- CreateTable
CREATE TABLE "spec_options" (
    "id" TEXT NOT NULL,
    "group" "spec_option_group" NOT NULL,
    "code" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "spec_options_pkey" PRIMARY KEY ("id"),
    -- Mã: chữ in hoa không dấu, số, gạch dưới đơn; tối đa 40 ký tự (khớp isValidSpecOptionCode)
    CONSTRAINT "spec_options_code_chk" CHECK ("code" ~ '^[A-Z0-9]+(_[A-Z0-9]+)*$' AND char_length("code") <= 40)
);

-- CreateTable
CREATE TABLE "spec_option_translations" (
    "option_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "spec_option_translations_pkey" PRIMARY KEY ("option_id","locale")
);

-- CreateIndex
CREATE UNIQUE INDEX "spec_options_group_code_key" ON "spec_options"("group", "code");

-- CreateIndex: danh sách theo nhóm, đúng thứ tự CMS
CREATE INDEX "spec_options_group_sort_order_id_idx" ON "spec_options"("group", "sort_order", "id");

-- AddForeignKey
ALTER TABLE "spec_option_translations" ADD CONSTRAINT "spec_option_translations_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "spec_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Nạp giá trị đang có trong code (nhãn vi/en giữ nguyên), id cố định so_<nhóm>_<mã>
CREATE TEMP TABLE "_seed_spec" ("grp" TEXT, "code" TEXT, "sort" INT, "vi" TEXT, "en" TEXT);
INSERT INTO "_seed_spec" VALUES
    ('EDGE_PROFILE', 'SQUARE', 0, 'Cạnh vuông phẳng', 'Square edge'),
    ('EDGE_PROFILE', 'TONGUE_GROOVE', 1, 'Âm dương (T&G)', 'Tongue & groove'),
    ('EDGE_PROFILE', 'SHIPLAP', 2, 'Shiplap', 'Shiplap'),
    ('EDGE_PROFILE', 'V_GROOVE', 3, 'Rãnh chữ V', 'V-groove'),
    ('CORE_COLOR', 'OFF_WHITE', 0, 'Trắng ngà', 'Off-white'),
    ('CORE_COLOR', 'LIGHT_GREY', 1, 'Xám nhạt', 'Light grey'),
    ('CORE_COLOR', 'CONCRETE_GREY', 2, 'Xám bê tông', 'Concrete grey'),
    ('SURFACE_FINISH', 'SMOOTH', 0, 'Nhẵn phẳng', 'Smooth'),
    ('SURFACE_FINISH', 'SANDED', 1, 'Chà nhám phẳng', 'Sanded'),
    ('SURFACE_FINISH', 'HPL', 2, 'Phủ HPL', 'HPL'),
    ('SURFACE_FINISH', 'PVC_FILM', 3, 'Màng PVC', 'PVC film'),
    ('SURFACE_FINISH', 'INTUMESCENT_PAINT', 4, 'Sơn chống cháy', 'Intumescent paint'),
    ('SURFACE_FINISH', 'PRINT_3D', 5, 'In 3D', '3D print'),
    ('SURFACE_FINISH', 'TEXTURED', 6, 'Nhám thô / hoa văn', 'Textured'),
    ('SCREW_HOLDING', 'EXCELLENT', 0, 'Xuất sắc', 'Excellent'),
    ('SCREW_HOLDING', 'GOOD', 1, 'Tốt', 'Good'),
    ('SCREW_HOLDING', 'STANDARD', 2, 'Tiêu chuẩn', 'Standard'),
    ('CRYSTAL_PHASE', 'PHASE_517', 0, 'Pha tinh thể 517', '517 crystal phase'),
    ('CRYSTAL_PHASE', 'PHASE_318', 1, 'Pha tinh thể 318', '318 crystal phase'),
    ('CRYSTAL_PHASE', 'OTHER', 2, 'Khác', 'Other'),
    ('VOC_LEVEL', 'VERY_LOW', 0, 'Cực thấp', 'Very low'),
    ('VOC_LEVEL', 'LOW', 1, 'Thấp', 'Low'),
    ('VOC_LEVEL', 'STANDARD', 2, 'Tiêu chuẩn', 'Standard'),
    ('SUITABLE_FLOORING', 'WOOD', 0, 'Sàn gỗ', 'Wood flooring'),
    ('SUITABLE_FLOORING', 'TILE', 1, 'Gạch men', 'Tiles'),
    ('SUITABLE_FLOORING', 'CARPET', 2, 'Thảm', 'Carpet'),
    ('SUITABLE_FLOORING', 'EPOXY', 3, 'Epoxy', 'Epoxy'),
    ('SUITABLE_FLOORING', 'VINYL', 4, 'Sàn vinyl', 'Vinyl'),
    ('SIP_CORE_MATERIAL', 'EPS', 0, 'EPS', 'EPS'),
    ('SIP_CORE_MATERIAL', 'XPS', 1, 'XPS', 'XPS'),
    ('SIP_CORE_MATERIAL', 'PU', 2, 'PU cứng', 'Rigid PU'),
    ('SIP_CORE_MATERIAL', 'PIR', 3, 'PIR', 'PIR'),
    ('SIP_CORE_MATERIAL', 'PHENOLIC', 4, 'Foam Phenolic', 'Phenolic foam'),
    ('LOAD_BEARING', 'STRUCTURAL', 0, 'Chịu lực kết cấu', 'Structural'),
    ('LOAD_BEARING', 'NON_STRUCTURAL', 1, 'Không chịu lực', 'Non-structural'),
    ('DECORATIVE_FINISH', 'HPL', 0, 'Phủ Laminate HPL', 'HPL laminate'),
    ('DECORATIVE_FINISH', 'PVC_FILM', 1, 'Phủ màng PVC', 'PVC film'),
    ('DECORATIVE_FINISH', 'INTUMESCENT_PAINT', 2, 'Sơn trương nở chống cháy', 'Intumescent coating'),
    ('DECORATIVE_FINISH', 'PRINT_3D', 3, 'In 3D theo thiết kế', 'Custom 3D print'),
    ('SCRATCH_RESISTANCE', 'VERY_HIGH', 0, 'Rất cao', 'Very high'),
    ('SCRATCH_RESISTANCE', 'HIGH', 1, 'Cao', 'High'),
    ('SCRATCH_RESISTANCE', 'STANDARD', 2, 'Tiêu chuẩn', 'Standard');

-- Mã đang có trong sản phẩm mà chưa thuộc danh sách trên (dữ liệu cũ) -> thêm vào, nhãn tạm = mã, để lưu lại sản phẩm không lỗi
INSERT INTO "_seed_spec" ("grp", "code", "sort", "vi", "en")
SELECT u."grp", u."code", 100, u."code", NULL
FROM (
    SELECT 'EDGE_PROFILE' AS "grp", "edge_profile"::text AS "code" FROM "product_technical_specs" WHERE "edge_profile" IS NOT NULL
    UNION SELECT 'EDGE_PROFILE', unnest("edge_profiles")::text FROM "floor_board_specs"
    UNION SELECT 'CORE_COLOR', "core_color" FROM "product_technical_specs" WHERE "core_color" IS NOT NULL
    UNION SELECT 'SURFACE_FINISH', "surface_finish" FROM "product_technical_specs" WHERE "surface_finish" IS NOT NULL
    UNION SELECT 'SCREW_HOLDING', "screw_holding_rating" FROM "product_technical_specs" WHERE "screw_holding_rating" IS NOT NULL
    UNION SELECT 'CRYSTAL_PHASE', "crystal_phase" FROM "product_technical_specs" WHERE "crystal_phase" IS NOT NULL
    UNION SELECT 'VOC_LEVEL', "voc_level" FROM "product_technical_specs" WHERE "voc_level" IS NOT NULL
    UNION SELECT 'SUITABLE_FLOORING', unnest("suitable_floorings") FROM "floor_board_specs"
    UNION SELECT 'SIP_CORE_MATERIAL', unnest("core_materials")::text FROM "sip_panel_specs"
    UNION SELECT 'LOAD_BEARING', "load_bearing" FROM "sip_panel_specs" WHERE "load_bearing" IS NOT NULL
    UNION SELECT 'DECORATIVE_FINISH', "finish_type"::text FROM "decorative_finish_options"
    UNION SELECT 'SCRATCH_RESISTANCE', "scratch_resistance" FROM "decorative_finish_options" WHERE "scratch_resistance" IS NOT NULL
) u
WHERE NOT EXISTS (SELECT 1 FROM "_seed_spec" s WHERE s."grp" = u."grp" AND s."code" = u."code");

INSERT INTO "spec_options" ("id", "group", "code", "sort_order", "updated_at")
SELECT 'so_' || lower("grp") || '_' || lower("code"), "grp"::"spec_option_group", "code", "sort", CURRENT_TIMESTAMP FROM "_seed_spec";

INSERT INTO "spec_option_translations" ("option_id", "locale", "label")
SELECT 'so_' || lower("grp") || '_' || lower("code"), 'vi'::"content_locale", "vi" FROM "_seed_spec"
UNION ALL
SELECT 'so_' || lower("grp") || '_' || lower("code"), 'en'::"content_locale", "en" FROM "_seed_spec" WHERE "en" IS NOT NULL;

DROP TABLE "_seed_spec";

-- Đổi cột enum sang text, GIỮ dữ liệu (không DROP / ADD cột)
ALTER TABLE "product_technical_specs" ALTER COLUMN "edge_profile" TYPE TEXT USING "edge_profile"::text;

ALTER TABLE "floor_board_specs" ALTER COLUMN "edge_profiles" DROP DEFAULT;
ALTER TABLE "floor_board_specs" ALTER COLUMN "edge_profiles" TYPE TEXT[] USING "edge_profiles"::text[];
ALTER TABLE "floor_board_specs" ALTER COLUMN "edge_profiles" SET DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "sip_panel_specs" ALTER COLUMN "core_materials" DROP DEFAULT;
ALTER TABLE "sip_panel_specs" ALTER COLUMN "core_materials" TYPE TEXT[] USING "core_materials"::text[];
ALTER TABLE "sip_panel_specs" ALTER COLUMN "core_materials" SET DEFAULT ARRAY[]::TEXT[];

-- Unique (product_id, finish_type) tự dựng lại theo kiểu mới
ALTER TABLE "decorative_finish_options" ALTER COLUMN "finish_type" TYPE TEXT USING "finish_type"::text;

-- DropEnum
DROP TYPE "edge_profile";
DROP TYPE "sip_core_material";
DROP TYPE "decorative_finish_type";

COMMIT;
