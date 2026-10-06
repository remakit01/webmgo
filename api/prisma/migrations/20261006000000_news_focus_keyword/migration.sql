-- Keyword chính theo từng ngôn ngữ của bài viết (chấm điểm SEO / AEO / GEO trong CMS)
ALTER TABLE "news_post_translations" ADD COLUMN "focus_keyword" TEXT;
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_focus_keyword_check"
  CHECK ("focus_keyword" IS NULL OR char_length("focus_keyword") <= 100);
