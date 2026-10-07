-- Tìm bài theo tiêu đề: không phân biệt hoa thường VÀ dấu tiếng Việt ("chong chay" khớp "Chống cháy"),
-- có index trigram nên LIKE '%từ khoá%' không phải quét cả bảng khi số bài lớn lên.
--
-- Prisma schema không mô tả được extension / hàm / index biểu thức -> CHỈ khai báo ở đây
-- (đã kiểm: `prisma migrate diff` bỏ qua index biểu thức, migrate dev sau này không đề xuất xoá).
-- Code dùng: NewsPostsService.searchPostIdsByTitle().

-- pg_trgm, unaccent là extension "trusted" (PG13+): chủ DB tạo được, không cần superuser
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Chuẩn hoá chuỗi để tìm kiếm: bỏ dấu (đ -> d) + chữ thường.
-- unaccent() mặc định là STABLE (phụ thuộc search_path) -> gọi bản 2 tham số với từ điển ghi rõ schema
-- để khai báo IMMUTABLE được (bắt buộc với index biểu thức).
CREATE OR REPLACE FUNCTION public.search_normalize(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT lower(public.unaccent('public.unaccent'::regdictionary, input)) $$;

CREATE INDEX "news_post_translations_title_search_idx"
  ON "news_post_translations" USING gin (public.search_normalize("title") public.gin_trgm_ops);
