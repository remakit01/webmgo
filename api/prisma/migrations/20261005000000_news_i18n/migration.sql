-- Tin tức song ngữ (vi/en): chuyên mục, tag, tác giả, bài viết + bản dịch theo ngôn ngữ, slug redirect dùng chung.
-- CreateEnum
CREATE TYPE "content_locale" AS ENUM ('vi', 'en');

-- CreateEnum
CREATE TYPE "publish_status" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "translation_origin" AS ENUM ('HUMAN', 'AI', 'AI_REVIEWED');

-- CreateTable
CREATE TABLE "slug_redirects" (
    "entity_type" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "old_slug" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slug_redirects_pkey" PRIMARY KEY ("entity_type","locale","old_slug")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'green',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_category_translations" (
    "category_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,

    CONSTRAINT "news_category_translations_pkey" PRIMARY KEY ("category_id","locale")
);

-- CreateTable
CREATE TABLE "news_tags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "news_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tag_translations" (
    "tag_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "news_tag_translations_pkey" PRIMARY KEY ("tag_id","locale")
);

-- CreateTable
CREATE TABLE "news_authors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "news_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_author_translations" (
    "author_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "job_title" TEXT,
    "bio" TEXT,

    CONSTRAINT "news_author_translations_pkey" PRIMARY KEY ("author_id","locale")
);

-- CreateTable
CREATE TABLE "news_posts" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "author_id" TEXT,
    "cover_image_key" TEXT,
    "cover_image_url" TEXT,
    "cover_images" JSONB,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_order" INTEGER,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "news_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_post_translations" (
    "post_id" TEXT NOT NULL,
    "locale" "content_locale" NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(3),
    "first_published_at" TIMESTAMPTZ(3),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sapo" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "content_text" TEXT NOT NULL DEFAULT '',
    "reading_minutes" INTEGER NOT NULL DEFAULT 1,
    "cover_alt" TEXT NOT NULL DEFAULT '',
    "cover_caption" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_image_url" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "source_name" TEXT,
    "source_url" TEXT,
    "origin" "translation_origin" NOT NULL DEFAULT 'HUMAN',
    "content_updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_updated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "news_post_translations_pkey" PRIMARY KEY ("post_id","locale")
);

-- CreateTable
CREATE TABLE "news_post_tags" (
    "post_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "news_post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateIndex
CREATE INDEX "slug_redirects_entity_type_entity_id_idx" ON "slug_redirects"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_category_translations_locale_slug_key" ON "news_category_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_tag_translations_locale_slug_key" ON "news_tag_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "news_posts_category_id_idx" ON "news_posts"("category_id");

-- CreateIndex
CREATE INDEX "news_posts_author_id_idx" ON "news_posts"("author_id");

-- CreateIndex
CREATE INDEX "news_posts_created_by_id_idx" ON "news_posts"("created_by_id");

-- CreateIndex
CREATE INDEX "news_posts_updated_by_id_idx" ON "news_posts"("updated_by_id");

-- CreateIndex
CREATE INDEX "news_posts_deleted_by_id_idx" ON "news_posts"("deleted_by_id");

-- CreateIndex
CREATE INDEX "news_posts_live_updated_at_idx" ON "news_posts"("updated_at" DESC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "news_post_translations_public_idx" ON "news_post_translations"("locale", "published_at" DESC) WHERE (status = 'PUBLISHED');

-- CreateIndex
CREATE INDEX "news_post_translations_scheduled_idx" ON "news_post_translations"("published_at") WHERE (status = 'SCHEDULED');

-- CreateIndex
CREATE UNIQUE INDEX "news_post_translations_locale_slug_key" ON "news_post_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "news_post_tags_tag_id_idx" ON "news_post_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "news_category_translations" ADD CONSTRAINT "news_category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tag_translations" ADD CONSTRAINT "news_tag_translations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "news_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_author_translations" ADD CONSTRAINT "news_author_translations_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "news_authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "news_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_post_tags" ADD CONSTRAINT "news_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_post_tags" ADD CONSTRAINT "news_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "news_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─── CHECK constraint (Prisma không khai báo được) ─────────────────────────────
-- Slug: khớp SLUG_PATTERN / SLUG_MAX_LENGTH trong @remak/shared/slug
ALTER TABLE "slug_redirects" ADD CONSTRAINT "slug_redirects_old_slug_check"
  CHECK ("old_slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("old_slug") <= 120);
ALTER TABLE "news_category_translations" ADD CONSTRAINT "news_category_translations_slug_check"
  CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("slug") <= 120);
ALTER TABLE "news_tag_translations" ADD CONSTRAINT "news_tag_translations_slug_check"
  CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("slug") <= 120);
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_slug_check"
  CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("slug") <= 120);

-- Độ dài (CMS cảnh báo sớm hơn: SEO title ~60, SEO description ~160)
ALTER TABLE "news_category_translations" ADD CONSTRAINT "news_category_translations_name_check"
  CHECK (char_length("name") BETWEEN 1 AND 100);
ALTER TABLE "news_tag_translations" ADD CONSTRAINT "news_tag_translations_name_check"
  CHECK (char_length("name") BETWEEN 1 AND 100);
ALTER TABLE "news_authors" ADD CONSTRAINT "news_authors_name_check"
  CHECK (char_length("name") BETWEEN 1 AND 120);
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_lengths_check"
  CHECK (
    char_length("title") BETWEEN 1 AND 200
    AND char_length("sapo") <= 600
    AND char_length("cover_alt") <= 300
    AND ("seo_title" IS NULL OR char_length("seo_title") <= 120)
    AND ("seo_description" IS NULL OR char_length("seo_description") <= 320)
  );

-- Màu chuyên mục: token thương hiệu (NEWS_CATEGORY_COLORS)
ALTER TABLE "news_categories" ADD CONSTRAINT "news_categories_color_check"
  CHECK ("color" IN ('green', 'orange', 'slate', 'blue', 'amber'));
ALTER TABLE "news_categories" ADD CONSTRAINT "news_categories_sort_order_check" CHECK ("sort_order" >= 0);
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_featured_order_check"
  CHECK ("featured_order" IS NULL OR "featured_order" >= 0);

-- JSON đúng dạng
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_cover_images_is_array_check"
  CHECK ("cover_images" IS NULL OR jsonb_typeof("cover_images") = 'array');
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_content_is_doc_check"
  CHECK (jsonb_typeof("content") = 'object' AND "content"->>'type' = 'doc');

-- Ràng buộc nghiệp vụ
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_reading_minutes_check"
  CHECK ("reading_minutes" >= 1);
-- Đã đăng / lên lịch thì phải có thời điểm đăng
ALTER TABLE "news_post_translations" ADD CONSTRAINT "news_post_translations_published_at_check"
  CHECK ("status" NOT IN ('SCHEDULED', 'PUBLISHED') OR "published_at" IS NOT NULL);
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_deleted_by_requires_deleted_at_check"
  CHECK ("deleted_by_id" IS NULL OR "deleted_at" IS NOT NULL);
