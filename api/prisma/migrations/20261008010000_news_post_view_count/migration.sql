-- Tổng lượt xem đếm sẵn trên news_posts: sắp xếp / lọc / hiển thị tổng không phải SUM cả bảng news_post_daily_stats
-- (bảng ngày lớn dần mãi — đo 732k dòng: SUM toàn bảng ~160ms, đọc cột ~0ms).
ALTER TABLE "news_posts" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_view_count_check" CHECK ("view_count" >= 0);

-- Lấy số từ dữ liệu đã có
UPDATE "news_posts" p SET "view_count" = s.total
FROM (SELECT "post_id", SUM("views")::int AS total FROM "news_post_daily_stats" GROUP BY "post_id") s
WHERE s."post_id" = p."id";

-- Mỗi lượt xem cập nhật 1 dòng: chừa 10% chỗ trống mỗi trang để Postgres cập nhật tại chỗ (HOT update),
-- cột view_count không đánh index nên không phải sửa index -> bảng ít phình.
ALTER TABLE "news_posts" SET (fillfactor = 90);
