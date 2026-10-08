# Loại sản phẩm quản lý trong CMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay enum `ProductType` bằng bảng `product_types` (tên/slug/mô tả/SEO vi-en, mẫu form thông số) quản lý được trong CMS, có trang loại trên web; bỏ `tradeName` và `shortName`.

**Architecture:** Bảng `ProductType` + `ProductTypeTranslation` theo mẫu `NewsCategory`; `Product.typeId` FK Restrict. Phần cố định duy nhất là enum `ProductSpecProfile` (NONE/SIP/FLOOR/DECORATIVE) quyết định khối thông số riêng. API CRUD trong module `products`, màn CMS theo mẫu `/admin/news/categories`, trang public `/san-pham/loai/[slug]` theo mẫu `/tin-tuc/chuyen-muc/[slug]`.

**Tech Stack:** Prisma 7 + PostgreSQL, NestJS 12 (ESM, đuôi `.js` trong import), vitest, Next.js 16 App Router + next-intl, `@remak/shared`.

**Spec:** `docs/superpowers/specs/2026-10-08-product-types-cms-design.md`

## Global Constraints

- Text hiển thị + comment: tiếng Việt; tên biến/hàm/file + commit: tiếng Anh, Conventional Commits (`feat(products): ...`).
- API: import tương đối có đuôi `.js`; `PrismaClient`/kiểu từ `src/generated/prisma/client.js`; Redis luôn qua `cacheOrLoad` / `cache.invalidate` (đã bọc try/catch).
- `orderBy` luôn kết thúc bằng cột unique (`id`; bản dịch: `typeId`).
- fe: không import Prisma/pg/Redis; link nội bộ web dùng `@/components/ui/LocaleLink`; fetch public qua `src/lib/api.ts` với tag `products`; lỗi fetch chỉ nuốt khi `phase-production-build`.
- `@remak/shared` không import Node/React/Nest; hàm mới có test `*.spec.ts` cạnh file.
- CMS desktop-only, bố cục `AdminPage` / `AdminPageBand` / `AdminPageBody`.
- Không chạy `pnpm --filter api db:seed` trên DB đang dùng. Không sửa migration `20261010000000_product_catalog`.
- `fe/src/app/[locale]/products/page.tsx` có thay đổi chưa commit của người dùng: sửa lên trên, không revert.

## Review Focus

1. Sản phẩm đã có trong DB local (tạo qua CMS) phải còn nguyên sau migration và trỏ đúng loại theo enum cũ — kiểm bằng SQL sau `db:migrate` (Task 2).
2. Đổi slug loại → URL cũ chuyển 308 sang slug mới; đổi A→B→A không tạo vòng lặp — test service (Task 3).
3. Sản phẩm đổi sang loại khác mẫu form: lưu được, khối spec cũ không bị báo lỗi, web không hiện spec cũ — test `productInputErrors` (Task 1) + mapper (Task 4).
4. Loại chưa có bản dịch tiếng Anh: không hiện ở `/en`, trang `/en/products/type/<slug-vi>` trả 404 chứ không vỡ — test public service (Task 4).
5. Sản phẩm đặt slug `loai` (vi) / `type` (en) bị từ chối với thông báo tiếng Việt — test shared (Task 1) + service (Task 4).

---

### Task 1: Contract dùng chung (`@remak/shared/contracts/product`)

**Files:**
- Modify: `packages/shared/src/contracts/product.ts`
- Test: `packages/shared/src/contracts/product.spec.ts`

**Interfaces:**
- Produces:
  - `PRODUCT_SPEC_PROFILES = ['NONE','SIP','FLOOR','DECORATIVE'] as const`, `type ProductSpecProfile`, `PRODUCT_SPEC_PROFILE_LABEL: Record<ProductSpecProfile, L10n>` (vi: Không có thông số riêng / Panel SIP / Tấm sàn / Tấm trang trí; en: None / SIP panel / Floor board / Decorative board).
  - `EXTENSION_OF_PROFILE: Partial<Record<ProductSpecProfile,'sip'|'floor'|'decorative'>>` (thay `EXTENSION_OF_TYPE`).
  - `interface ProductTypeRef { id: string; specProfile: ProductSpecProfile; name: string; slug: string }`
  - `interface ProductTypeTranslationCms { name: string; slug: string; description: string | null; seoTitle: string | null; seoDescription: string | null }`
  - `interface ProductTypeCms { id: string; specProfile: ProductSpecProfile; sortOrder: number; isActive: boolean; productCount: number; trashedProductCount: number; version: string; translations: Partial<Record<Locale, ProductTypeTranslationCms>> }`
  - `interface ProductTypeTranslationInput { name: string; slug?: string; description: string | null; seoTitle: string | null; seoDescription: string | null }`
  - `interface ProductTypeInput { specProfile: ProductSpecProfile; isActive: boolean; translations: { vi: ProductTypeTranslationInput; en: ProductTypeTranslationInput | null } }`
  - `PRODUCT_TYPE_LIMITS = { name: 100, slug: 120, description: 500, seoTitle: 120, seoDescription: 320 } as const`
  - `interface ProductTypePublic extends ProductTypeRef { description: string | null; seo: { title: string; description: string }; alternates: Partial<Record<Locale, string>> }`
  - `type ProductTypeBySlugResponse = { type: ProductTypePublic; products: ProductListItemPublic[] } | { redirect: string }`
  - `interface ProductTypeSitemapEntry { slugs: Partial<Record<Locale, string>> }`
  - `PRODUCT_TYPE_PATH_SEGMENT: Record<Locale, string> = { vi: 'loai', en: 'type' }`, `isReservedProductSlug(locale: Locale, slug: string): boolean`.
  - `ProductListItemPublic`: bỏ `productType`, `shortName`; thêm `type: ProductTypeRef`. `ProductDetailPublic`: bỏ `tradeName`. `ProductListItemCms`: bỏ `productType`, `tradeName`; thêm `type: { id: string; name: string; specProfile: ProductSpecProfile }`.
  - `ProductInput`: `productType` → `typeId: string`; bỏ `tradeName`. `ProductTranslationInput`: bỏ `shortName`. `PRODUCT_LIMITS`: bỏ `shortName`, `tradeName`.
  - `productInputErrors(p: ProductInput, specProfile: ProductSpecProfile)`; `emptyProductInput(typeId = '')`; `emptyExtensionFor(profile: ProductSpecProfile)`.
  - Xoá `PRODUCT_TYPES`, `ProductType`, `PRODUCT_TYPE_LABEL`, `EXTENSION_OF_TYPE`.

- [ ] **Step 1: Write the failing tests** in `product.spec.ts`:

```ts
describe('isReservedProductSlug', () => {
  it('chặn đoạn đường dẫn trang loại theo đúng ngôn ngữ', () => {
    expect(isReservedProductSlug('vi', 'loai')).toBe(true);
    expect(isReservedProductSlug('en', 'type')).toBe(true);
    expect(isReservedProductSlug('vi', 'type')).toBe(false);
    expect(isReservedProductSlug('vi', 'loai-tam')).toBe(false);
  });
});

describe('productInputErrors theo mẫu form', () => {
  it('SIP chỉ hợp lệ với mẫu SIP', () => {
    const p = { ...emptyProductInput('t1'), ...emptyExtensionFor('SIP') };
    p.translations.vi.name = 'Panel';
    expect(productInputErrors(p, 'SIP').sip).toBeUndefined();
    expect(productInputErrors(p, 'NONE').sip).toBe('Thông số SIP chỉ dùng cho loại Panel SIP');
  });
  it('emptyExtensionFor(NONE) không tạo khối nào', () => {
    expect(emptyExtensionFor('NONE')).toEqual({ sip: null, floor: null, decorative: null });
  });
});
```

- [ ] **Step 2: Run** `pnpm --filter @remak/shared test` — Expected: FAIL (`isReservedProductSlug` không tồn tại).
- [ ] **Step 3: Implement** các thay đổi trong Interfaces. Thông báo lỗi trong `productInputErrors` giữ nguyên câu chữ cũ.
- [ ] **Step 4: Run** `pnpm --filter @remak/shared test` — Expected: PASS. Build: `pnpm --filter @remak/shared build` — PASS (api/fe sẽ lỗi kiểu cho tới Task 4/6/7 — bình thường).
- [ ] **Step 5: Commit** `feat(shared): add product type contracts and spec profiles`

---

### Task 2: Schema Prisma + migration chuyển dữ liệu + seed

**Files:**
- Modify: `api/prisma/schema.prisma` (enum `ProductType` dòng 57–66, model `Product` 127–154, `ProductTranslation.shortName` dòng 162)
- Create: `api/prisma/migrations/20261011000000_product_types/migration.sql`
- Modify: `api/prisma/seed-data/products.ts`, `api/prisma/seed-products.ts`

**Interfaces:**
- Produces: Prisma models `ProductType`, `ProductTypeTranslation`, enum `ProductSpecProfile`, `Product.typeId` + `Product.type` (đúng như spec mục 1). Id cố định của 6 loại: `pt_standard`, `pt_sip_panel`, `pt_floor`, `pt_decorative`, `pt_litecore`, `pt_custom`.

- [ ] **Step 1: Sửa `schema.prisma`** theo spec mục 1 (xoá enum `ProductType`, bỏ `tradeName`, `shortName`; `typeId String @map("product_type_id")`, `type ProductType @relation(fields: [typeId], references: [id], onDelete: Restrict)`, `@@index([typeId])`).
- [ ] **Step 2: Viết migration SQL** theo thứ tự:
  1. `CREATE TYPE "product_spec_profile" AS ENUM (...)`; `CREATE TABLE "product_types"`, `"product_type_translations"` (PK `(type_id, locale)`, unique `(locale, slug)`, FK cascade).
  2. `INSERT` 6 loại (id cố định, `spec_profile`, `sort_order` 0–5, `updated_at = now()`) + 12 bản dịch đúng bảng tên/slug trong spec.
  3. `ALTER TABLE products ADD COLUMN product_type_id TEXT`; `UPDATE products SET product_type_id = CASE product_type WHEN 'STANDARD' THEN 'pt_standard' ... END`; `SET NOT NULL`; FK `ON DELETE RESTRICT ON UPDATE CASCADE`; `CREATE INDEX "products_product_type_id_idx"`.
  4. `DROP COLUMN product_type, trade_name`; `ALTER TABLE product_translations DROP COLUMN short_name`; `DROP TYPE "product_type"`.
  Comment đầu file tiếng Việt giải thích vì sao chuyển dữ liệu tại chỗ.
- [ ] **Step 3: Seed:** `seed-data/products.ts` — bỏ `tradeName`, `vi.shortName`; `productType` → `typeSlug` (slug vi, vd `'tam-san-mgo'`). `seed-products.ts` — tra `typeId` qua `productTypeTranslation.findUnique({ where: { locale_slug: { locale: 'vi', slug } } })` (loại đã có nhờ migration), bỏ `tradeName`/`shortName`.
- [ ] **Step 4: Run** `pnpm --filter api db:migrate` (áp migration lên DB local, KHÔNG reset) rồi `pnpm --filter api db:generate`. Expected: migrate áp `20261011000000_product_types` không hỏi reset; kiểm `SELECT p.id, t.name FROM products p JOIN product_type_translations t ON t.type_id = p.product_type_id AND t.locale='vi'` — mọi sản phẩm có loại. Nếu `migrate dev` báo drift → dừng, báo người dùng.
- [ ] **Step 5: Commit** `feat(db): move product types to a CMS-managed table`

---

### Task 3: API CRUD Loại sản phẩm

**Files:**
- Create: `api/src/products/dto/product-type.dto.ts`, `api/src/products/product-types.service.ts`, `api/src/products/product-types.controller.ts`
- Test: `api/src/products/product-types.service.spec.ts`
- Modify: `api/src/products/products.module.ts`, `api/src/products/products.constants.ts`, `api/src/slug-redirect/slug-redirect.service.ts`

**Interfaces:**
- Consumes: kiểu từ Task 1; `resolveUniqueSlug`, `assertVersion`/`assertUpdated`/`versionOf`, `SlugRedirectService`, `ContentCacheService`, `PRODUCTS_INVALIDATE`.
- Produces:
  - `PRODUCT_TYPE_SLUG_ENTITY = 'product_type' as const` (constants); `SlugEntityType` thêm `'product_type'`.
  - `ProductTypesService`: `list(): Promise<ProductTypeCms[]>`, `create(dto): Promise<ProductTypeCms>`, `update(id, dto, ifMatch?): Promise<ProductTypeCms>`, `reorder(ids: string[]): Promise<ProductTypeCms[]>`, `remove(id): Promise<{ success: true }>`.
  - Controller `@Controller('products/types')`, guards/roles như `NewsTaxonomyController`; `PUT order` khai báo trước `PUT :id`; `DELETE :id` chỉ `ADMIN`. Đăng ký controller **trước** `ProductsController` trong module (tránh `products/:id` che).
  - DTO `UpsertProductTypeDto` (class-validator, giới hạn `PRODUCT_TYPE_LIMITS`, `specProfile` `@IsIn(PRODUCT_SPEC_PROFILES)`), `ReorderProductTypesDto { ids: string[] }`.

Hành vi (copy theo `NewsTaxonomyService` category, khác ở chỗ):
- `list`: `orderBy [{ sortOrder: 'asc' }, { id: 'asc' }]`; `productCount` = sản phẩm `deletedAt: null`; `trashedProductCount` qua `groupBy typeId` với `deletedAt not null`.
- `update`: trong transaction, với mỗi locale có slug cũ ≠ slug mới → `slugRedirects.release(..., newSlug, tx)` rồi `record(PRODUCT_TYPE_SLUG_ENTITY, locale, old, new, id, tx)`.
- Slug: `resolveUniqueSlug` với `isTaken` = trùng bản dịch loại khác cùng locale, fallback `'loai-san-pham'`.
- `remove`: đếm mọi sản phẩm (kể cả thùng rác) → 409 `Loại còn ${n} sản phẩm (kể cả trong thùng rác) — hãy chuyển sang loại khác trước`; xoá xong `slugRedirects.removeFor`.
- `reorder` lệch → 409 `Danh sách loại vừa thay đổi — tải lại trang rồi sắp lại`; SQL thô `UPDATE product_types ... unnest` không đổi `updated_at`.
- Mọi ghi → `cache.invalidate(PRODUCTS_INVALIDATE)`.

- [ ] **Step 1: Write failing tests** (mock Prisma theo kiểu `news-taxonomy.service.spec.ts`):
  - `remove` khi `product.count` = 2 → reject `ConflictException` với message chứa `'Loại còn 2 sản phẩm'`; không gọi `productType.delete`.
  - `update` đổi slug vi `tam-san-mgo` → `tam-san-mgo-cao-cap` → `slugRedirects.record` được gọi với `('product_type','vi','tam-san-mgo','tam-san-mgo-cao-cap', id, tx)`; không đổi slug → không gọi `record`.
  - `create` với slug tự nhập đã có → reject `ConflictException`.
  - `reorder(['a'])` khi DB có `['a','b']` → reject `ConflictException`.
- [ ] **Step 2: Run** `pnpm --filter api test -- product-types` — Expected: FAIL (module không tồn tại).
- [ ] **Step 3: Implement** service, DTO, controller, đăng ký module, hằng số, `SlugEntityType`.
- [ ] **Step 4: Run** `pnpm --filter api test -- product-types` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(api): add product type CRUD endpoints`

---

### Task 4: API Sản phẩm dùng loại mới + endpoint loại công khai

**Files:**
- Modify: `api/src/products/products.service.ts`, `api/src/products/products.mapper.ts`, `api/src/products/dto/product-input.dto.ts`, `api/src/products/products-public.service.ts`, `api/src/products/products-public.controller.ts`
- Test: `api/src/products/products.mapper.spec.ts`, `api/src/products/products.service.spec.ts`, `api/src/products/products-public.service.spec.ts` (tạo mới nếu chưa có)

**Interfaces:**
- Consumes: Task 1 kiểu; Task 2 model; `PRODUCT_TYPE_SLUG_ENTITY` (Task 3).
- Produces:
  - Mapper: `productListInclude` / `productDetailInclude` thêm `type: { include: { translations: true } }`; `typeRefOf(type, locale): ProductTypeRef` (fallback bản dịch vi); `extensionOf` dựa `p.type.specProfile`; bỏ `tradeName`, `shortName` mọi nơi; `toListItemCms` trả `type` (tên vi).
  - `ProductsService.create/update`: ghi `typeId`; kiểm loại tồn tại → `BadRequestException('Loại sản phẩm không tồn tại')`; `assertValid` gọi `productInputErrors(dto, profile)` với profile của loại; slug sản phẩm `isReservedProductSlug` → `BadRequestException('Đường dẫn "loai" dành cho trang loại sản phẩm, hãy chọn đường dẫn khác')` (giá trị theo locale).
  - `ProductsPublicService.types(locale): Promise<ProductTypeRef[]>` — loại `isActive`, có bản dịch locale, có ≥1 sản phẩm hiển thị ở locale; `orderBy sortOrder, id`; cache key `types:<locale>`.
  - `ProductsPublicService.typeBySlug(slug, locale): Promise<ProductTypeBySlugResponse | null>` — tìm theo bản dịch locale + `isActive`; không thấy → slug cũ (`slugRedirects.resolve`) hoặc slug ngôn ngữ khác → `{ redirect }` nếu loại có slug ở locale, ngược lại `null`. `products` = như `list(locale)` lọc `typeId`.
  - `ProductsPublicService.typesSitemap(): Promise<ProductTypeSitemapEntry[]>`.
  - Controller: `GET types`, `GET types/sitemap`, `GET types/:slug` khai báo **trước** `GET :slug`.

- [ ] **Step 1: Write failing tests:**
  - mapper: sản phẩm `type.specProfile = 'NONE'` nhưng có `sipSpec` → `toDetailPublic(...).spec` không chứa phần SIP (`extension` null); `toListItemPublic(...).type` = `{ id, specProfile, name: <tên en>, slug: <slug en> }` khi locale `en`.
  - service: `create` với `typeId` không tồn tại → `BadRequestException`; slug vi `'loai'` → `BadRequestException`.
  - public: `typeBySlug('tam-san-mgo', 'en')` khi loại chỉ có bản vi → `null`; slug cũ trong `slugRedirects` → `{ redirect: 'slug-moi' }`.
- [ ] **Step 2: Run** `pnpm --filter api test -- products` — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `pnpm --filter api test` rồi `pnpm --filter api lint` và `pnpm --filter api build` — Expected: tất cả PASS.
- [ ] **Step 5: Commit** `feat(api): link products to product types and expose public type pages`

---

### Task 5: CMS — màn Loại Sản Phẩm

**Files:**
- Create: `fe/src/app/admin/products/types/page.tsx`, `fe/src/cms/components/products/types/ProductTypeTable.tsx`, `fe/src/cms/components/products/types/ProductTypeEditor.tsx`, `fe/src/cms/components/products/types/product-type-form.ts`
- Modify: `fe/src/cms/lib/products-api.ts`, `fe/src/cms/components/AdminSidebar.tsx`, `fe/src/lib/product-paths.ts`

**Interfaces:**
- Consumes: `ProductTypeCms`, `ProductTypeInput`, `PRODUCT_SPEC_PROFILE_LABEL`, `PRODUCT_TYPE_LIMITS` (Task 1); endpoints Task 3.
- Produces:
  - `productsApi.types()`, `createType(body)`, `updateType(id, body, version)`, `removeType(id)`, `reorderTypes(ids)`.
  - `productTypePath(locale, slug)` = `toLocalePath(\`/san-pham/loai/${slug}\`, locale)` trong `product-paths.ts`.
  - `product-type-form.ts`: `ProductTypeForm`, `emptyProductTypeForm()`, `toProductTypeForm(t)`, `toProductTypeInput(f)`, `validateProductType(f)`, `isProductTypeDirty(a, b)`, `PRODUCT_TYPE_PATH_PREFIX` — sao theo `category-form.ts` (thay `color` bằng `specProfile`).

Giao diện sao theo `fe/src/app/admin/news/categories/page.tsx` + `CategoryTable` + `CategoryEditor`: deep link `?edit=`, ▲▼ sắp thứ tự, `useConfirm` khi xoá, nút Xoá khoá khi `productCount + trashedProductCount > 0` (tooltip nêu số), editor có select mẫu form (nhãn `PRODUCT_SPEC_PROFILE_LABEL[*].vi`) và cảnh báo vàng *"Loại đang có N sản phẩm — đổi mẫu form sẽ ẩn khối thông số riêng hiện có của các sản phẩm này"* khi đổi `specProfile` và `productCount > 0`. Sidebar: mục `products` thành `hasSubmenu` với `Sản Phẩm` (`/admin/products`) và `Loại Sản Phẩm` (`/admin/products/types`); active của `Sản Phẩm` không bật khi ở `/admin/products/types`.

- [ ] **Step 1: Implement** api client, path helper, form helpers, table, editor, page, sidebar.
- [ ] **Step 2: Run** `pnpm --filter mgo_remak lint` — Expected: không lỗi trong file mới (lỗi kiểu ở file cũ xử lý ở Task 6–7).
- [ ] **Step 3: Kiểm tay** (`pnpm dev:api` + `pnpm dev:fe`, đăng nhập `/admin/products/types`): thêm loại "Tấm thử nghiệm" mẫu NONE → hiện cuối bảng; sửa slug vi; ▲▼; xoá loại trống được; nút xoá loại có sản phẩm bị khoá. Xoá loại thử khi xong.
- [ ] **Step 4: Commit** `feat(cms): add product types management screen`

---

### Task 6: CMS — form sản phẩm dùng loại từ API

**Files:**
- Modify: `fe/src/cms/components/products/ProductEditor.tsx`, `fe/src/cms/components/products/product-form.ts`, `fe/src/cms/components/products/ProductContentSection.tsx`, `fe/src/cms/components/products/ProductExtensionSection.tsx`, `fe/src/cms/components/products/ProductTable.tsx`, `fe/src/app/admin/products/new/page.tsx` (nếu gọi `emptyProductInput`)

**Interfaces:**
- Consumes: `productsApi.types()` (Task 5), `EXTENSION_OF_PROFILE`, `emptyExtensionFor(profile)`, `productInputErrors(p, profile)` (Task 1).

- [ ] **Step 1: Implement:**
  - `ProductEditor`: tải `productsApi.types()` khi mount; options = loại `isActive` + loại hiện tại của sản phẩm (kể cả đã tắt), nhãn `translations.vi.name`; `profile` = `specProfile` của loại đang chọn (chưa tải xong → `'NONE'`); `changeType(typeId)` dùng `emptyExtensionFor(profile mới)`; `visibleSections` dùng `EXTENSION_OF_PROFILE[profile]`; sản phẩm mới mặc định loại đầu tiên đang bật. Thêm link "Quản lý loại" (`/admin/products/types`, mở tab mới) cạnh ô chọn. Bỏ ô "Tên thương mại".
  - `ProductContentSection`: bỏ ô "Tên ngắn".
  - `ProductTable`: bỏ ` · tradeName`; nhãn loại = `p.type.name`.
  - `ProductExtensionSection` / `product-form.ts`: thay `productType` bằng profile truyền vào.
- [ ] **Step 2: Run** `pnpm --filter mgo_remak lint` — Expected: không lỗi trong `fe/src/cms`.
- [ ] **Step 3: Kiểm tay:** mở sản phẩm Panel SIP → thấy khối SIP; đổi sang "Tấm MgO tiêu chuẩn" → khối SIP ẩn, lưu được; đổi lại → khối SIP trống mới. Tạo sản phẩm mới không lỗi.
- [ ] **Step 4: Commit** `feat(cms): pick product type from CMS-managed list`

---

### Task 7: Web public — trang loại, catalog, sitemap

**Files:**
- Modify: `fe/src/i18n/routing.ts`, `fe/src/lib/api.ts`, `fe/src/components/product-catalog/CatalogBrowser.tsx`, `fe/src/components/product-catalog/CatalogCard.tsx`, `fe/src/app/[locale]/products/page.tsx`, `fe/src/app/[locale]/products/[slug]/page.tsx`, `fe/src/app/sitemap.ts`, `fe/docs/ROUTES_CONTENT_MAP.md`
- Create: `fe/src/app/[locale]/products/type/[slug]/page.tsx`

**Interfaces:**
- Consumes: endpoints Task 4; `productTypePath` (Task 5); `ProductTypeRef`, `ProductTypeBySlugResponse`, `ProductTypeSitemapEntry` (Task 1).
- Produces: `getProductTypes(locale)`, `getProductType(locale, slug)`, `getProductTypesSitemap()` trong `fe/src/lib/api.ts` (tag `PRODUCTS_REVALIDATE_TAG`).

- [ ] **Step 1: Implement:**
  - `routing.ts`: `'/products/type/[slug]': { vi: '/san-pham/loai/[slug]', en: '/products/type/[slug]' }` (đặt trước `'/products/[slug]'`).
  - Trang loại: sao cấu trúc `fe/src/app/[locale]/news/category/[slug]/page.tsx` (`revalidate = 60`, `generateStaticParams` từ `getProductTypes`, `generateMetadata` từ `type.seo` + `localizedAlternates(type.alternates)`, `setRequestLocale`, `permanentRedirect(productTypePath(locale, redirect))`, `notFound()`, `<SetLocaleAlternates>`); nội dung: h1 tên loại, mô tả, lưới `CatalogCard`, `SampleRequestForm`.
  - `products/page.tsx`: tải thêm `getProductTypes(locale)`, truyền `types` cho `CatalogBrowser`.
  - `CatalogBrowser`: prop `types: ProductTypeRef[]` thay `PRODUCT_TYPES`; lọc theo `i.type.id`; khi đang lọc một loại hiện link `LocaleLink` "Xem trang loại" (nhãn qua `messages/vi.json` + `en.json`); cột so sánh nhãn loại `i.type.name`; bỏ `shortName` ở tìm kiếm và cột so sánh (`name`, `line-clamp-2`).
  - `CatalogCard`: nhãn loại `item.type.name`.
  - Trang chi tiết: nhãn loại là `LocaleLink` tới `productTypePath(locale, p.type.slug)`; bỏ `tradeName`; breadcrumb dùng `p.name`.
  - `sitemap.ts`: thêm URL trang loại vi + en (en chỉ khi có slug en), `priority: 0.7`.
  - `ROUTES_CONTENT_MAP.md`: thêm dòng route mới.
- [ ] **Step 2: Run** `pnpm --filter mgo_remak lint` và `pnpm --filter mgo_remak build` — Expected: PASS.
- [ ] **Step 3: Kiểm tay** (dev): `/san-pham` lọc theo loại; `/san-pham/loai/tam-san-mgo` và `/en/products/type/mgo-floor-board` hiện đúng sản phẩm; nút đổi ngôn ngữ chuyển đúng slug; đổi slug loại trong CMS rồi mở URL cũ → chuyển hướng; `/san-pham/<slug-sp>` hiện tên loại có link. Desktop + mobile 360px.
- [ ] **Step 4: Commit** `feat(products): add product type pages and CMS-driven catalog filters`

---

### Task 8: Kiểm tra toàn bộ

- [ ] **Step 1: Run** lần lượt: `pnpm --filter @remak/shared test`, `pnpm --filter api lint`, `pnpm --filter api test`, `pnpm --filter api build`, `pnpm --filter mgo_remak lint`, `pnpm --filter mgo_remak build`. Expected: tất cả PASS.
- [ ] **Step 2: Grep** `rg "PRODUCT_TYPES|PRODUCT_TYPE_LABEL|EXTENSION_OF_TYPE|tradeName|productType" api/src fe/src packages/shared/src` — Expected: chỉ còn trong dữ liệu tĩnh cũ ngoài phạm vi (`fe/src/data`, `fe/src/types/product.ts`) nếu có, không còn trong catalog mới.
- [ ] **Step 3:** Báo kết quả cho người dùng (không tự push/mở PR khi chưa được yêu cầu).
