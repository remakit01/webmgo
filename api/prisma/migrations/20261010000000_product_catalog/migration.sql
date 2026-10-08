-- Sản phẩm tấm MgO theo docs/catalog-mgo/MODEL_*.md: Product + bản dịch + TDS chung (1-1) + quy cách theo độ dày (1-N)
-- + mở rộng SIP / Sàn / Trang trí (1-1) + chứng chỉ. Thay bảng products / product_specs cũ (chưa từng có dữ liệu, chưa có code nào dùng).
-- Áp dụng supabase-postgres-best-practices: numeric cho số đo, FK đều có index, partial index, CHECK nghiệp vụ.

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('STANDARD', 'SIP_PANEL', 'FLOOR', 'DECORATIVE', 'LITECORE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "price_mode" AS ENUM ('FIXED', 'CONTACT');

-- CreateEnum
CREATE TYPE "stock_status" AS ENUM ('IN_STOCK', 'LIMITED', 'PRE_ORDER', 'BACK_ORDER', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "sale_unit" AS ENUM ('SHEET', 'M2');

-- CreateEnum
CREATE TYPE "edge_profile" AS ENUM ('SQUARE', 'TONGUE_GROOVE', 'SHIPLAP', 'V_GROOVE');

-- CreateEnum
CREATE TYPE "sip_core_material" AS ENUM ('EPS', 'XPS', 'PU', 'PIR', 'PHENOLIC');

-- CreateEnum
CREATE TYPE "decorative_finish_type" AS ENUM ('HPL', 'PVC_FILM', 'INTUMESCENT_PAINT', 'PRINT_3D');

-- DropForeignKey
ALTER TABLE "product_specs" DROP CONSTRAINT "product_specs_product_id_fkey";

-- DropIndex
DROP INDEX "products_slug_key";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "description",
DROP COLUMN "is_active",
DROP COLUMN "name",
DROP COLUMN "slug",
ADD COLUMN     "cover_image_key" TEXT,
ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "gallery" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "product_type" "product_type" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "trade_name" TEXT;

-- DropTable
DROP TABLE "product_specs";

-- CreateTable
CREATE TABLE "product_translations" (
    "product_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(3),
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "summary" TEXT NOT NULL DEFAULT '',
    "description" JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}',
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "advantages" JSONB NOT NULL DEFAULT '[]',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "cover_alt" TEXT NOT NULL DEFAULT '',
    "gallery_alts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "focus_keyword" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_image_url" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "origin" "translation_origin" NOT NULL DEFAULT 'HUMAN',
    "content_updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_updated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("product_id","locale")
);

-- CreateTable
CREATE TABLE "product_technical_specs" (
    "product_id" TEXT NOT NULL,
    "standard_sizes" JSONB NOT NULL DEFAULT '[]',
    "edge_profile" "edge_profile",
    "core_color" TEXT,
    "surface_finish" TEXT,
    "density_min_kg_m3" INTEGER,
    "density_max_kg_m3" INTEGER,
    "density_reduction_pct" DECIMAL(5,2),
    "flexural_min_mpa" DECIMAL(6,2),
    "flexural_max_mpa" DECIMAL(6,2),
    "flexural_cross_min_mpa" DECIMAL(6,2),
    "screw_holding_rating" TEXT,
    "reaction_to_fire_class" TEXT,
    "fire_class_standards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "max_temperature_c" INTEGER,
    "thermal_conductivity_wmk" DECIMAL(6,4),
    "sound_reduction_min_db" INTEGER,
    "sound_reduction_max_db" INTEGER,
    "water_absorption_max_pct" DECIMAL(5,2),
    "thickness_swelling_max_pct" DECIMAL(5,3),
    "mold_resistant" BOOLEAN,
    "crystal_phase" TEXT,
    "mgo_content_min_pct" DECIMAL(5,2),
    "chloride_max_pct" DECIMAL(5,3),
    "asbestos_free" BOOLEAN,
    "formaldehyde_mg_l" DECIMAL(6,3),
    "voc_level" TEXT,
    "green_certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extra_specs" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_technical_specs_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT,
    "thickness_mm" DECIMAL(5,2) NOT NULL,
    "width_mm" INTEGER NOT NULL,
    "length_mm" INTEGER NOT NULL,
    "weight_kg" DECIMAL(8,2),
    "density_kg_m3" INTEGER,
    "fire_rating_min_minutes" INTEGER,
    "fire_rating_max_minutes" INTEGER,
    "fire_rating_label" TEXT,
    "flexural_min_mpa" DECIMAL(6,2),
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "price_mode" "price_mode" NOT NULL DEFAULT 'CONTACT',
    "price_vnd" INTEGER,
    "compare_at_price_vnd" INTEGER,
    "sale_unit" "sale_unit" NOT NULL DEFAULT 'SHEET',
    "price_valid_until" DATE,
    "stock_status" "stock_status" NOT NULL DEFAULT 'IN_STOCK',
    "lead_time_days" INTEGER,
    "min_order_qty" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_translations" (
    "variant_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "label" TEXT,
    "recommended_use" TEXT,

    CONSTRAINT "product_variant_translations_pkey" PRIMARY KEY ("variant_id","locale")
);

-- CreateTable
CREATE TABLE "sip_panel_specs" (
    "product_id" TEXT NOT NULL,
    "core_materials" "sip_core_material"[] DEFAULT ARRAY[]::"sip_core_material"[],
    "core_thickness_min_mm" INTEGER,
    "core_thickness_max_mm" INTEGER,
    "facing_thicknesses_mm" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "max_width_mm" INTEGER,
    "max_length_mm" INTEGER,
    "load_bearing" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sip_panel_specs_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "floor_board_specs" (
    "product_id" TEXT NOT NULL,
    "edge_profiles" "edge_profile"[] DEFAULT ARRAY[]::"edge_profile"[],
    "floor_sizes" JSONB NOT NULL DEFAULT '[]',
    "suitable_floorings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "moisture_resistant_floor" BOOLEAN,
    "sanded_surface" BOOLEAN,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "floor_board_specs_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "decorative_finish_specs" (
    "product_id" TEXT NOT NULL,
    "custom_print_supported" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "decorative_finish_specs_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "decorative_finish_options" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "finish_type" "decorative_finish_type" NOT NULL,
    "scratch_resistance" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "decorative_finish_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decorative_finish_option_translations" (
    "option_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "patterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suitable_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "decorative_finish_option_translations_pkey" PRIMARY KEY ("option_id","locale")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "certificate_no" TEXT,
    "issuing_body" TEXT,
    "test_standard" TEXT,
    "result" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "file_key" TEXT,
    "file_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_translations" (
    "certificate_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "certificate_translations_pkey" PRIMARY KEY ("certificate_id","locale")
);

-- CreateTable
CREATE TABLE "product_certificates" (
    "product_id" TEXT NOT NULL,
    "certificate_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_certificates_pkey" PRIMARY KEY ("product_id","certificate_id")
);

-- CreateTable
CREATE TABLE "product_variant_certificates" (
    "variant_id" TEXT NOT NULL,
    "certificate_id" TEXT NOT NULL,

    CONSTRAINT "product_variant_certificates_pkey" PRIMARY KEY ("variant_id","certificate_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_locale_slug_key" ON "product_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_sort_order_id_idx" ON "product_variants"("product_id", "sort_order", "id");

-- CreateIndex
CREATE INDEX "product_variants_fire_idx" ON "product_variants"("fire_rating_max_minutes") WHERE (is_active);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_thickness_mm_width_mm_length_mm_key" ON "product_variants"("product_id", "thickness_mm", "width_mm", "length_mm");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_one_default_idx" ON "product_variants"("product_id") WHERE (is_default);

-- CreateIndex
CREATE INDEX "decorative_finish_options_product_id_sort_order_id_idx" ON "decorative_finish_options"("product_id", "sort_order", "id");

-- CreateIndex
CREATE UNIQUE INDEX "decorative_finish_options_product_id_finish_type_key" ON "decorative_finish_options"("product_id", "finish_type");

-- CreateIndex
CREATE INDEX "certificates_expiry_idx" ON "certificates"("expiry_date") WHERE (is_public AND expiry_date IS NOT NULL);

-- CreateIndex
CREATE INDEX "product_certificates_certificate_id_idx" ON "product_certificates"("certificate_id");

-- CreateIndex
CREATE INDEX "product_variant_certificates_certificate_id_idx" ON "product_variant_certificates"("certificate_id");

-- CreateIndex
CREATE INDEX "products_live_idx" ON "products"("sort_order", "id") WHERE (deleted_at IS NULL);

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_technical_specs" ADD CONSTRAINT "product_technical_specs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_translations" ADD CONSTRAINT "product_variant_translations_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sip_panel_specs" ADD CONSTRAINT "sip_panel_specs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_board_specs" ADD CONSTRAINT "floor_board_specs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decorative_finish_specs" ADD CONSTRAINT "decorative_finish_specs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decorative_finish_options" ADD CONSTRAINT "decorative_finish_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decorative_finish_option_translations" ADD CONSTRAINT "decorative_finish_option_translations_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "decorative_finish_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_translations" ADD CONSTRAINT "certificate_translations_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_certificates" ADD CONSTRAINT "product_variant_certificates_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_certificates" ADD CONSTRAINT "product_variant_certificates_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─── Ràng buộc nghiệp vụ (Prisma không biểu diễn được) ─────────────────────
-- Tên cố định do migration tạo bảng mới -> viết thẳng, không cần DO $$ (skill schema-constraints)

-- JSON phải đúng dạng (fe đọc an toàn)
ALTER TABLE "products" ADD CONSTRAINT "products_gallery_chk" CHECK (jsonb_typeof("gallery") = 'array');
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_json_chk" CHECK (
  jsonb_typeof("description") = 'object' AND jsonb_typeof("advantages") = 'array' AND jsonb_typeof("faqs") = 'array'
);
ALTER TABLE "floor_board_specs" ADD CONSTRAINT "floor_board_specs_sizes_chk" CHECK (jsonb_typeof("floor_sizes") = 'array');

-- TDS: khoảng min ≤ max, số dương, phần trăm 0–100
ALTER TABLE "product_technical_specs"
  ADD CONSTRAINT "product_technical_specs_json_chk" CHECK (jsonb_typeof("standard_sizes") = 'array' AND jsonb_typeof("extra_specs") = 'array'),
  ADD CONSTRAINT "product_technical_specs_ranges_chk" CHECK (
    ("density_min_kg_m3" IS NULL OR "density_max_kg_m3" IS NULL OR "density_min_kg_m3" <= "density_max_kg_m3")
    AND ("flexural_min_mpa" IS NULL OR "flexural_max_mpa" IS NULL OR "flexural_min_mpa" <= "flexural_max_mpa")
    AND ("sound_reduction_min_db" IS NULL OR "sound_reduction_max_db" IS NULL OR "sound_reduction_min_db" <= "sound_reduction_max_db")
  ),
  ADD CONSTRAINT "product_technical_specs_positive_chk" CHECK (
    ("density_min_kg_m3" IS NULL OR "density_min_kg_m3" > 0) AND ("density_max_kg_m3" IS NULL OR "density_max_kg_m3" > 0)
    AND ("flexural_min_mpa" IS NULL OR "flexural_min_mpa" > 0) AND ("flexural_max_mpa" IS NULL OR "flexural_max_mpa" > 0)
    AND ("flexural_cross_min_mpa" IS NULL OR "flexural_cross_min_mpa" > 0)
    AND ("max_temperature_c" IS NULL OR "max_temperature_c" > 0) AND ("thermal_conductivity_wmk" IS NULL OR "thermal_conductivity_wmk" > 0)
    AND ("sound_reduction_min_db" IS NULL OR "sound_reduction_min_db" >= 0) AND ("formaldehyde_mg_l" IS NULL OR "formaldehyde_mg_l" >= 0)
  ),
  ADD CONSTRAINT "product_technical_specs_pct_chk" CHECK (
    ("density_reduction_pct" IS NULL OR "density_reduction_pct" BETWEEN 0 AND 100)
    AND ("water_absorption_max_pct" IS NULL OR "water_absorption_max_pct" BETWEEN 0 AND 100)
    AND ("thickness_swelling_max_pct" IS NULL OR "thickness_swelling_max_pct" BETWEEN 0 AND 100)
    AND ("mgo_content_min_pct" IS NULL OR "mgo_content_min_pct" BETWEEN 0 AND 100)
    AND ("chloride_max_pct" IS NULL OR "chloride_max_pct" BETWEEN 0 AND 100)
  );

-- Quy cách: giá có thì > 0, giá gốc > giá bán, số dương, EI min ≤ max
ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_price_chk" CHECK ("price_mode" = 'CONTACT' OR ("price_vnd" IS NOT NULL AND "price_vnd" > 0)),
  ADD CONSTRAINT "product_variants_compare_at_chk" CHECK ("compare_at_price_vnd" IS NULL OR ("price_vnd" IS NOT NULL AND "compare_at_price_vnd" > "price_vnd")),
  ADD CONSTRAINT "product_variants_positive_chk" CHECK (
    "thickness_mm" > 0 AND "width_mm" > 0 AND "length_mm" > 0
    AND ("weight_kg" IS NULL OR "weight_kg" > 0) AND ("density_kg_m3" IS NULL OR "density_kg_m3" > 0)
    AND ("flexural_min_mpa" IS NULL OR "flexural_min_mpa" > 0)
    AND ("lead_time_days" IS NULL OR "lead_time_days" >= 0) AND ("min_order_qty" IS NULL OR "min_order_qty" > 0)
  ),
  ADD CONSTRAINT "product_variants_fire_chk" CHECK (
    ("fire_rating_min_minutes" IS NULL OR "fire_rating_min_minutes" >= 0)
    AND ("fire_rating_max_minutes" IS NULL OR "fire_rating_max_minutes" >= 0)
    AND ("fire_rating_min_minutes" IS NULL OR "fire_rating_max_minutes" IS NULL OR "fire_rating_min_minutes" <= "fire_rating_max_minutes")
  );

-- SIP: độ dày lõi min ≤ max, số dương
ALTER TABLE "sip_panel_specs" ADD CONSTRAINT "sip_panel_specs_ranges_chk" CHECK (
  ("core_thickness_min_mm" IS NULL OR "core_thickness_min_mm" > 0) AND ("core_thickness_max_mm" IS NULL OR "core_thickness_max_mm" > 0)
  AND ("core_thickness_min_mm" IS NULL OR "core_thickness_max_mm" IS NULL OR "core_thickness_min_mm" <= "core_thickness_max_mm")
  AND ("max_width_mm" IS NULL OR "max_width_mm" > 0) AND ("max_length_mm" IS NULL OR "max_length_mm" > 0)
);

-- Chứng chỉ: hết hạn không trước ngày cấp
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_dates_chk" CHECK ("issue_date" IS NULL OR "expiry_date" IS NULL OR "expiry_date" >= "issue_date");
