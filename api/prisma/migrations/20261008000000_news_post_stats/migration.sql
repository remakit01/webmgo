-- Lượt xem / đọc hết bài / nguồn truy cập của bài Tin tức, gộp theo ngày (không lưu từng lượt, không lưu IP)
CREATE TYPE "traffic_source" AS ENUM ('DIRECT', 'INTERNAL', 'SEARCH', 'AI', 'SOCIAL', 'OTHER');

CREATE TABLE "news_post_daily_stats" (
    "post_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "day" DATE NOT NULL,
    "source" "traffic_source" NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "reads" INTEGER NOT NULL DEFAULT 0,
    "read_seconds" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "news_post_daily_stats_pkey" PRIMARY KEY ("post_id", "locale", "day", "source"),
    CONSTRAINT "news_post_daily_stats_counts_check" CHECK ("views" >= 0 AND "reads" >= 0 AND "read_seconds" >= 0)
);

-- "Xem nhiều N ngày" và Dashboard lọc theo khoảng ngày
CREATE INDEX "news_post_daily_stats_day_idx" ON "news_post_daily_stats"("day");

ALTER TABLE "news_post_daily_stats" ADD CONSTRAINT "news_post_daily_stats_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
