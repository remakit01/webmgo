# Loại sản phẩm quản lý trong CMS — Thiết kế

Ngày: 2026-10-08 · Nhánh: `feature/mgo-catalog-model-architecture`

## Mục tiêu

- Loại sản phẩm **thêm / sửa / xoá / sắp thứ tự** được trong CMS, không cố định trong code.
- Mỗi loại có **tên + slug + mô tả + SEO theo từng ngôn ngữ** (vi/en).
- Mỗi loại có **trang riêng** trên web: `/san-pham/loai/<slug-vi>` ⇄ `/en/products/type/<slug-en>`.
- Xoá hẳn trường **Tên thương mại** (`tradeName`) và **Tên ngắn** (`shortName`) của sản phẩm.

## Quyết định đã chốt

| Vấn đề | Quyết định |
| --- | --- |
| Form thông số riêng (SIP / Sàn / Trang trí) | Mỗi loại chọn 1 **mẫu form** `specProfile` ∈ `NONE \| SIP \| FLOOR \| DECORATIVE`. Danh sách mẫu cố định trong code (mỗi mẫu có bảng DB + ô nhập riêng); mọi thứ khác của loại là dữ liệu. |
| Slug dùng ở đâu | Trang riêng SSG/ISR, index được, có SEO title/description. |
| Xoá loại còn sản phẩm | Không cho xoá (API 409 + FK `ON DELETE RESTRICT`). Phải chuyển sản phẩm sang loại khác (kể cả sản phẩm trong thùng rác) hoặc tắt loại. |
| Đổi slug | Ghi `SlugRedirect` (`entityType = 'product_type'`) → URL cũ chuyển hướng vĩnh viễn. |
| Đổi mẫu form của loại đang có sản phẩm | Cho phép, CMS cảnh báo trước. Dữ liệu spec cũ của sản phẩm giữ nguyên trong DB, chỉ không hiển thị / không xuất ra web. |
| Đổi loại của một sản phẩm | Như trên — spec cũ giữ trong DB, ẩn đi. |
| Migration | Migration mới `20261011000000_product_types`, chuyển dữ liệu tại chỗ (tạo 6 loại với id cố định, gán `product_type_id` theo enum cũ, rồi bỏ cột/enum cũ). Không sửa migration đã áp, không cần reset DB hay chạy seed (seed đặt lại mật khẩu admin). |

## 1. Dữ liệu

### Prisma

```prisma
enum ProductSpecProfile {
  NONE
  SIP
  FLOOR
  DECORATIVE
  @@map("product_spec_profile")
}

model ProductType {
  id          String             @id @default(cuid())
  specProfile ProductSpecProfile @default(NONE) @map("spec_profile")
  sortOrder   Int                @default(0) @map("sort_order")
  isActive    Boolean            @default(true) @map("is_active")
  createdAt   DateTime           @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime           @updatedAt @map("updated_at") @db.Timestamptz(3)

  translations ProductTypeTranslation[]
  products     Product[]

  @@map("product_types")
}

model ProductTypeTranslation {
  typeId         String        @map("type_id")
  locale         ContentLocale
  name           String
  slug           String
  description    String?
  seoTitle       String?       @map("seo_title")
  seoDescription String?       @map("seo_description")

  type ProductType @relation(fields: [typeId], references: [id], onDelete: Cascade)

  @@id([typeId, locale])
  @@unique([locale, slug])
  @@map("product_type_translations")
}
```

`Product`:
- bỏ `productType ProductType` (enum) → thêm `typeId String @map("product_type_id")` + `type ProductType @relation(..., onDelete: Restrict)` + `@@index([typeId])`.
- bỏ `tradeName`.

`ProductTranslation`: bỏ `shortName`.

Xoá enum `ProductType` cũ.

### Seed 6 loại hiện có

| Cũ | specProfile | vi: tên / slug | en: tên / slug |
| --- | --- | --- | --- |
| STANDARD | NONE | Tấm MgO tiêu chuẩn / `tam-mgo-tieu-chuan` | Standard MgO board / `standard-mgo-board` |
| SIP_PANEL | SIP | Panel SIP MgO / `panel-sip-mgo` | MgO SIP panel / `mgo-sip-panel` |
| FLOOR | FLOOR | Tấm sàn MgO / `tam-san-mgo` | MgO floor board / `mgo-floor-board` |
| DECORATIVE | DECORATIVE | Tấm trang trí FireSafe / `tam-trang-tri-firesafe` | FireSafe decorative board / `firesafe-decorative-board` |
| LITECORE | NONE | Tấm composite LiteCore™ / `tam-composite-litecore` | LiteCore™ composite board / `litecore-composite-board` |
| CUSTOM | NONE | Tấm MgO tuỳ chỉnh / `tam-mgo-tuy-chinh` | Custom MgO board / `custom-mgo-board` |

Seed sản phẩm tham chiếu loại qua slug vi; bỏ `tradeName`, `shortName` khỏi `seed-data/products.ts`.

### `@remak/shared/contracts/product`

- Xoá `PRODUCT_TYPES`, `ProductType`, `PRODUCT_TYPE_LABEL`.
- Thêm `PRODUCT_SPEC_PROFILES`, `ProductSpecProfile`, `PRODUCT_SPEC_PROFILE_LABEL` (vi/en).
- `EXTENSION_OF_TYPE` → `EXTENSION_OF_PROFILE: Partial<Record<ProductSpecProfile, 'sip' | 'floor' | 'decorative'>>`; `emptyProductInput(profile)`.
- Kiểu mới: `ProductTypeRef` (`id, specProfile, name, slug` — 1 ngôn ngữ, dùng ở web), `ProductTypeCms` (đủ bản dịch vi/en + `productCount`), `ProductTypeInput`, `PRODUCT_TYPE_LIMITS`.
- `PRODUCT_TYPE_PATH_SEGMENT = { vi: 'loai', en: 'type' }`: sản phẩm không được đặt slug trùng giá trị này ở ngôn ngữ tương ứng (tránh đụng route `/san-pham/loai/...`). Hàm thuần kiểm tra + test.
- Input sản phẩm: `productType` → `typeId: string`; bỏ `tradeName`, `shortName` khỏi kiểu, `PRODUCT_LIMITS`, giá trị mặc định.

## 2. API

Trong module `products` (file mới `product-types.controller.ts`, `product-types.service.ts`, `dto/product-type.dto.ts`).

| Endpoint | Quyền | Ghi chú |
| --- | --- | --- |
| `GET /products/types` | ADMIN, EDITOR | Kèm bản dịch vi/en, `productCount` (gồm thùng rác). Sắp `sortOrder, id`. |
| `POST /products/types` | ADMIN, EDITOR | `sortOrder` = max + 1. |
| `PUT /products/types/order` | ADMIN, EDITOR | Nhận mảng id; lệch danh sách → 409 "Danh sách loại vừa thay đổi — tải lại trang rồi sắp lại". |
| `PUT /products/types/:id` | ADMIN, EDITOR | Slug đổi → ghi `SlugRedirect`. |
| `DELETE /products/types/:id` | ADMIN | Còn sản phẩm → 409 "Loại còn N sản phẩm (kể cả trong thùng rác) — hãy chuyển sang loại khác trước". |
| `GET /products/public/types?locale=` | public | Loại đang bật, có ≥ 1 sản phẩm đã xuất bản ở locale đó. |
| `GET /products/public/types/:slug?locale=` | public | Loại + sản phẩm; slug cũ / slug ngôn ngữ khác → `{ redirect }`; loại tắt → 404. |

Kiểm tra khi lưu: tên bắt buộc cho vi (en tuỳ chọn — thiếu thì loại không hiện ở web tiếng Anh); slug hợp lệ theo `@remak/shared/slug`, không trùng trong cùng locale (lỗi 409 tiếng Việt), không trùng slug cũ trong `SlugRedirect` của loại khác.

Sản phẩm: DTO dùng `typeId` (tồn tại, kiểm tra trong service → 400 nếu không có); mapper dùng `p.type.specProfile` thay `p.productType`; dữ liệu public trả `type: ProductTypeRef`. Bỏ `tradeName`, `shortName` ở DTO / service / mapper.

Cache: mọi thay đổi loại → xoá prefix `PRODUCTS_INVALIDATE` + revalidate tag `products` (dùng lại cơ chế hiện có, Redis bọc try/catch). Không thêm tag mới.

`SlugEntityType` thêm `'product_type'`.

Test (vitest): service loại (tạo, trùng slug, đổi slug ghi redirect, chặn xoá khi còn sản phẩm, sắp thứ tự lệch), mapper (spec theo `specProfile`), hàm kiểm tra slug dành sẵn ở shared.

## 3. CMS

- `AdminSidebar`: "Sản Phẩm MGO" có submenu **Sản Phẩm** (`/admin/products`) và **Loại Sản Phẩm** (`/admin/products/types`); active state đúng cho `/admin/products/[id]`, `/new`.
- `fe/src/app/admin/products/types/page.tsx` + `fe/src/cms/components/products/types/*`, bố cục `AdminPage` / `AdminPageBand` / `AdminPageBody`, desktop-only:
  - Bảng: tên vi, tên en (hoặc "chưa có bản dịch"), slug vi/en, mẫu form, số sản phẩm, công tắc bật/tắt, thao tác Sửa/Xoá; kéo thả sắp thứ tự.
  - Dialog Thêm/Sửa: chọn mẫu form; 2 tab Tiếng Việt / English — tên, slug (tự sinh từ tên khi chưa sửa tay), mô tả, SEO title, SEO description.
  - Đổi mẫu form khi `productCount > 0` → cảnh báo trong dialog.
  - Xoá qua `ConfirmDialog`; `productCount > 0` → nút khoá + tooltip giải thích.
  - Lỗi API hiển thị tiếng Việt.
- `ProductEditor`: ô "Loại sản phẩm" lấy danh sách từ `GET /products/types` (chỉ loại đang bật + loại hiện tại của sản phẩm); khối spec riêng theo `specProfile` của loại đã chọn; link "Quản lý loại". Bỏ ô "Tên thương mại"; `ProductContentSection` bỏ ô "Tên ngắn"; `ProductTable` bỏ phần tên thương mại, cột loại lấy tên từ API.

## 4. Web public

- `routing.ts`: `'/products/type/[slug]': { vi: '/san-pham/loai/[slug]', en: '/products/type/[slug]' }`.
- `fe/src/app/[locale]/products/type/[slug]/page.tsx`: `revalidate = 60`, `generateStaticParams` từ API (fallback rỗng chỉ khi `phase-production-build`), `setRequestLocale`, metadata từ SEO của loại, `localizedAlternates` chỉ với ngôn ngữ có bản dịch, `<SetLocaleAlternates>`, `permanentRedirect` khi API trả `redirect`, `notFound()` khi 404. Nội dung: tiêu đề + mô tả loại, lưới `CatalogCard`, `SampleRequestForm`.
- `fe/src/lib/api.ts`: `getProductTypes(locale)`, `getProductType(slug, locale)` với `tags: ['products']`; `fe/src/lib/product-paths.ts`: `productTypePath(locale, slug)`.
- `CatalogBrowser`: nút lọc lấy từ danh sách loại API (giữ lọc tại chỗ, thêm link "Xem trang loại"); nhãn loại lấy `item.type.name`; bỏ `shortName` ở tìm kiếm và cột so sánh (`name` + `line-clamp-2`).
- `CatalogCard`: nhãn loại từ `item.type.name`.
- Trang chi tiết sản phẩm: dòng trên tiêu đề = tên loại (link `LocaleLink` sang trang loại), bỏ `tradeName`; breadcrumb dùng `name`.
- Sitemap: thêm URL trang loại (vi + en nếu có bản dịch).
- Cập nhật `fe/docs/ROUTES_CONTENT_MAP.md`.

Ngoài phạm vi: dữ liệu tĩnh cũ `fe/src/data/products.ts`, `fe/src/types/product.ts` và các component còn đọc từ đó (`SearchModal`, `ProductCompareBar`, `ProductCompareModal`); `navigation.ts`; `manifest.ts`.

## Kiểm tra trước khi xong

- `pnpm --filter @remak/shared test`
- `pnpm --filter api db:generate`, `lint`, `test`, `build`
- `pnpm --filter mgo_remak lint`, `build`
- Chạy local: tạo / sửa (đổi slug) / sắp / tắt / xoá loại trong CMS; xoá loại còn sản phẩm bị chặn; trang `/san-pham/loai/...` và `/en/products/type/...` hiển thị, slug cũ chuyển hướng; form sản phẩm hiện đúng khối spec theo mẫu form.
