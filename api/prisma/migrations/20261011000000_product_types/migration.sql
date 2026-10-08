-- Loại sản phẩm chuyển từ enum "product_type" sang bảng product_types (quản lý trong CMS: thêm / sửa / xoá, tên + slug vi/en).
-- Chuyển dữ liệu TẠI CHỖ: tạo 6 loại cũ với id cố định, gán product_type_id theo enum cũ rồi mới bỏ cột / enum
-- -> DB đang dùng không mất sản phẩm, không cần reset hay seed lại.
-- Đồng thời bỏ products.trade_name và product_translations.short_name (không còn dùng).

-- CreateEnum
CREATE TYPE "product_spec_profile" AS ENUM ('NONE', 'SIP', 'FLOOR', 'DECORATIVE');

-- CreateTable
CREATE TABLE "product_types" (
    "id" TEXT NOT NULL,
    "spec_profile" "product_spec_profile" NOT NULL DEFAULT 'NONE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_type_translations" (
    "type_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,

    CONSTRAINT "product_type_translations_pkey" PRIMARY KEY ("type_id","locale")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_type_translations_locale_slug_key" ON "product_type_translations"("locale", "slug");

-- AddForeignKey
ALTER TABLE "product_type_translations" ADD CONSTRAINT "product_type_translations_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "product_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6 loại có sẵn (id cố định để seed / dữ liệu cũ tham chiếu được)
INSERT INTO "product_types" ("id", "spec_profile", "sort_order", "updated_at") VALUES
    ('pt_standard',   'NONE',       0, CURRENT_TIMESTAMP),
    ('pt_sip_panel',  'SIP',        1, CURRENT_TIMESTAMP),
    ('pt_floor',      'FLOOR',      2, CURRENT_TIMESTAMP),
    ('pt_decorative', 'DECORATIVE', 3, CURRENT_TIMESTAMP),
    ('pt_litecore',   'NONE',       4, CURRENT_TIMESTAMP),
    ('pt_custom',     'NONE',       5, CURRENT_TIMESTAMP);

INSERT INTO "product_type_translations" ("type_id", "locale", "name", "slug") VALUES
    ('pt_standard',   'vi', 'Tấm MgO tiêu chuẩn',        'tam-mgo-tieu-chuan'),
    ('pt_standard',   'en', 'Standard MgO board',        'standard-mgo-board'),
    ('pt_sip_panel',  'vi', 'Panel SIP MgO',             'panel-sip-mgo'),
    ('pt_sip_panel',  'en', 'MgO SIP panel',             'mgo-sip-panel'),
    ('pt_floor',      'vi', 'Tấm sàn MgO',               'tam-san-mgo'),
    ('pt_floor',      'en', 'MgO floor board',           'mgo-floor-board'),
    ('pt_decorative', 'vi', 'Tấm trang trí FireSafe',    'tam-trang-tri-firesafe'),
    ('pt_decorative', 'en', 'FireSafe decorative board', 'firesafe-decorative-board'),
    ('pt_litecore',   'vi', 'Tấm composite LiteCore™',   'tam-composite-litecore'),
    ('pt_litecore',   'en', 'LiteCore™ composite board', 'litecore-composite-board'),
    ('pt_custom',     'vi', 'Tấm MgO tuỳ chỉnh',         'tam-mgo-tuy-chinh'),
    ('pt_custom',     'en', 'Custom MgO board',          'custom-mgo-board');

-- Gán loại cho sản phẩm hiện có theo enum cũ
ALTER TABLE "products" ADD COLUMN "product_type_id" TEXT;
UPDATE "products" SET "product_type_id" = CASE "product_type"
    WHEN 'STANDARD'   THEN 'pt_standard'
    WHEN 'SIP_PANEL'  THEN 'pt_sip_panel'
    WHEN 'FLOOR'      THEN 'pt_floor'
    WHEN 'DECORATIVE' THEN 'pt_decorative'
    WHEN 'LITECORE'   THEN 'pt_litecore'
    WHEN 'CUSTOM'     THEN 'pt_custom'
END;
ALTER TABLE "products" ALTER COLUMN "product_type_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "products_product_type_id_idx" ON "products"("product_type_id");

-- AddForeignKey: loại còn sản phẩm (kể cả trong thùng rác) thì không xoá được
ALTER TABLE "products" ADD CONSTRAINT "products_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Bỏ cột / enum cũ
ALTER TABLE "products" DROP COLUMN "product_type",
DROP COLUMN "trade_name";

ALTER TABLE "product_translations" DROP COLUMN "short_name";

DROP TYPE "product_type";
