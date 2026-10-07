-- Mọi ORDER BY kết thúc bằng cột unique (id / post_id) để phân trang ổn định: bài trùng mốc thời gian
-- không bị lặp hay mất giữa các trang. Mở rộng 2 index của danh sách có phân trang cho khớp thứ tự mới
-- (Postgres đọc thẳng theo index, không phải sắp lại).

-- DropIndex
DROP INDEX "news_post_translations_public_idx";

-- DropIndex
DROP INDEX "news_posts_live_updated_at_idx";

-- CreateIndex
CREATE INDEX "news_post_translations_public_idx" ON "news_post_translations"("locale", "published_at" DESC, "post_id" DESC) WHERE (status = 'PUBLISHED');

-- CreateIndex
CREATE INDEX "news_posts_live_updated_at_idx" ON "news_posts"("updated_at" DESC, "id" DESC) WHERE (deleted_at IS NULL);
