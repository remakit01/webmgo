-- Lượt xem trang Sản phẩm (chỉ hiện trong CMS): gộp theo ngày / ngôn ngữ / nguồn như news_post_daily_stats
-- (không lưu từng lượt, không lưu IP) + tổng đếm sẵn trên products.

CREATE TABLE "product_daily_stats" (
    "product_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "day" DATE NOT NULL,
    "source" "traffic_source" NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_daily_stats_pkey" PRIMARY KEY ("product_id", "locale", "day", "source"),
    CONSTRAINT "product_daily_stats_views_check" CHECK ("views" >= 0)
);

-- Dashboard lọc theo khoảng ngày
CREATE INDEX "product_daily_stats_day_idx" ON "product_daily_stats"("day");

ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tổng lượt xem đếm sẵn: danh sách CMS đọc cột, không SUM bảng ngày
ALTER TABLE "products" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD CONSTRAINT "products_view_count_check" CHECK ("view_count" >= 0);

-- Mỗi lượt xem cập nhật 1 dòng products: chừa chỗ để Postgres cập nhật tại chỗ (HOT update), view_count không có index
ALTER TABLE "products" SET (fillfactor = 90);
