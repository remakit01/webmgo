-- Postgres best practices (viết tay — KHÔNG dùng bản Prisma tự sinh vì bản đó DROP/ADD cột => mất dữ liệu):
-- 1. Cột camelCase có quote -> snake_case: RENAME COLUMN (giữ nguyên dữ liệu)
-- 2. timestamp -> timestamptz: dữ liệu cũ Prisma ghi theo UTC => diễn giải lại "AT TIME ZONE 'UTC'"
-- 3. Index cho mọi khoá ngoại; partial index cho soft delete
-- 4. CHECK constraint (Prisma không khai báo được trong schema)

-- ─── Enum ────────────────────────────────────────────────────────────────────
ALTER TYPE "Role" RENAME TO "role";

-- ─── users ───────────────────────────────────────────────────────────────────
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "users"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- ─── products ────────────────────────────────────────────────────────────────
ALTER TABLE "products" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "products" RENAME COLUMN "sortOrder" TO "sort_order";
ALTER TABLE "products" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "products" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "products"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';
ALTER TABLE "products" ADD CONSTRAINT "products_sort_order_check" CHECK ("sort_order" >= 0);

-- ─── product_specs ───────────────────────────────────────────────────────────
ALTER TABLE "product_specs" RENAME COLUMN "productId" TO "product_id";
ALTER TABLE "product_specs" RENAME COLUMN "fireRating" TO "fire_rating";
ALTER TABLE "product_specs" RENAME COLUMN "bendStrength" TO "bend_strength";
ALTER TABLE "product_specs" RENAME CONSTRAINT "product_specs_productId_fkey" TO "product_specs_product_id_fkey";
CREATE INDEX "product_specs_product_id_idx" ON "product_specs"("product_id");

-- ─── banners ─────────────────────────────────────────────────────────────────
ALTER TABLE "banners" RENAME COLUMN "ctaText" TO "cta_text";
ALTER TABLE "banners" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "banners" RENAME COLUMN "imageKey" TO "image_key";
ALTER TABLE "banners" RENAME COLUMN "linkUrl" TO "link_url";
ALTER TABLE "banners" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "banners" RENAME COLUMN "sortOrder" TO "sort_order";
ALTER TABLE "banners" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "banners" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "banners" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "banners" RENAME COLUMN "deletedById" TO "deleted_by_id";
ALTER TABLE "banners" RENAME CONSTRAINT "banners_deletedById_fkey" TO "banners_deleted_by_id_fkey";
ALTER TABLE "banners"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "deleted_at" TYPE TIMESTAMPTZ(3) USING "deleted_at" AT TIME ZONE 'UTC';

-- Index composite cũ (deletedAt, sortOrder) thay bằng 2 partial index đúng với từng truy vấn
DROP INDEX "banners_deletedAt_sortOrder_idx";
-- Danh sách CMS + trang chủ: WHERE deleted_at IS NULL ORDER BY sort_order
CREATE INDEX "banners_live_sort_order_idx" ON "banners"("sort_order") WHERE (deleted_at IS NULL);
-- Thùng rác (ORDER BY deleted_at DESC) + job dọn (deleted_at < cutoff)
CREATE INDEX "banners_trash_deleted_at_idx" ON "banners"("deleted_at") WHERE (deleted_at IS NOT NULL);
-- Khoá ngoại tới users (ON DELETE SET NULL)
CREATE INDEX "banners_deleted_by_id_idx" ON "banners"("deleted_by_id");

ALTER TABLE "banners" ADD CONSTRAINT "banners_sort_order_check" CHECK ("sort_order" >= 0);
ALTER TABLE "banners" ADD CONSTRAINT "banners_images_is_array_check" CHECK (jsonb_typeof("images") = 'array');
-- Có người xoá thì phải có thời điểm xoá (deleted_by_id có thể NULL khi user bị xoá: ON DELETE SET NULL)
ALTER TABLE "banners" ADD CONSTRAINT "banners_deleted_by_requires_deleted_at_check"
  CHECK ("deleted_by_id" IS NULL OR "deleted_at" IS NOT NULL);

-- ─── site_settings ───────────────────────────────────────────────────────────
ALTER TABLE "site_settings" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "site_settings"
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';
