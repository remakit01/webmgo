# Danh mục thông số quản lý trong CMS — Thiết kế

Ngày: 2026-10-09 · Nhánh: `feature/cms-spec-options` · Người dùng đã duyệt cả 4 phần, giao cho executor quyết theo đề xuất.

## Mục tiêu

Không còn danh sách giá trị thông số nào cố định trong code. 11 danh sách hiện là hằng số trong `@remak/shared/contracts/product` (+ 3 enum Postgres) chuyển thành dữ liệu: thêm / sửa nhãn vi-en / sắp thứ tự / bật-tắt / xoá trong CMS.

Ngoài phạm vi (giữ cố định vì gắn logic): `PriceMode` (ẩn giá khi liên hệ), `StockStatus` (ánh xạ schema.org), `SaleUnit`, `ProductSpecProfile` (mỗi mẫu có bảng riêng). Trường tự do (`fireClassStandards`, `greenCertifications`, mẫu vân…) đã là tag tự nhập — giữ nguyên.

## 11 nhóm

| Group | Trường sản phẩm (cột) | Kiểu cột |
| --- | --- | --- |
| `EDGE_PROFILE` | `product_technical_specs.edge_profile`, `floor_board_specs.edge_profiles` | text, text[] |
| `CORE_COLOR` | `product_technical_specs.core_color` | text |
| `SURFACE_FINISH` | `product_technical_specs.surface_finish` | text |
| `SCREW_HOLDING` | `product_technical_specs.screw_holding_rating` | text |
| `CRYSTAL_PHASE` | `product_technical_specs.crystal_phase` | text |
| `VOC_LEVEL` | `product_technical_specs.voc_level` | text |
| `SUITABLE_FLOORING` | `floor_board_specs.suitable_floorings` | text[] |
| `SIP_CORE_MATERIAL` | `sip_panel_specs.core_materials` | text[] |
| `LOAD_BEARING` | `sip_panel_specs.load_bearing` | text |
| `DECORATIVE_FINISH` | `decorative_finish_options.finish_type` | text (unique theo sản phẩm giữ nguyên) |
| `SCRATCH_RESISTANCE` | `decorative_finish_options.scratch_resistance` | text |

"Kiểu cạnh" (thông số chung) và "Kiểu cạnh ghép" (tấm sàn) dùng chung nhóm `EDGE_PROFILE`.

## 1. Dữ liệu

```prisma
enum SpecOptionGroup { EDGE_PROFILE CORE_COLOR SURFACE_FINISH SCREW_HOLDING CRYSTAL_PHASE VOC_LEVEL SUITABLE_FLOORING SIP_CORE_MATERIAL LOAD_BEARING DECORATIVE_FINISH SCRATCH_RESISTANCE  @@map("spec_option_group") }

model SpecOption {
  id        String          @id @default(cuid())
  group     SpecOptionGroup
  /// Mã lưu trong cột sản phẩm — KHÔNG đổi sau khi tạo
  code      String
  sortOrder Int             @default(0) @map("sort_order")
  isActive  Boolean         @default(true) @map("is_active")
  createdAt / updatedAt (timestamptz)
  translations SpecOptionTranslation[]
  @@unique([group, code])
  @@index([group, sortOrder, id])
  @@map("spec_options")
}

model SpecOptionTranslation {
  optionId String @map("option_id"); locale ContentLocale; label String
  option SpecOption @relation(..., onDelete: Cascade)
  @@id([optionId, locale])
  @@map("spec_option_translations")
}
```

- CHECK `code ~ '^[A-Z0-9]+(_[A-Z0-9]+)*$'` và độ dài ≤ 40.
- Migration `20261012000000_spec_options`: tạo bảng; nạp mọi mã hiện có + nhãn vi/en đúng như `SPEC_KEY_LABEL` / `EDGE_PROFILE_LABEL` / `SIP_CORE_MATERIAL_LABEL` / `DECORATIVE_FINISH_TYPE_LABEL` hiện tại (mã dùng chung nhiều nhóm như `STANDARD`, `HPL` được nạp vào từng nhóm tương ứng); đổi 4 cột enum sang text bằng `USING col::text` (`edge_profile[]` → `text[]` bằng `USING col::text[]`); xoá enum `edge_profile`, `sip_core_material`, `decorative_finish_type`. Không đổi dữ liệu sản phẩm, không cần reset/seed.
- Prisma: các field đó thành `String?` / `String[]`.

`@remak/shared/contracts/product`:
- Xoá `EDGE_PROFILES`, `SIP_CORE_MATERIALS`, `DECORATIVE_FINISH_TYPES`, `CORE_COLORS`, `SURFACE_FINISHES`, `SCREW_HOLDING_RATINGS`, `CRYSTAL_PHASES`, `VOC_LEVELS`, `SUITABLE_FLOORINGS`, `LOAD_BEARING_TYPES`, `SCRATCH_RESISTANCES`, `EDGE_PROFILE_LABEL`, `SIP_CORE_MATERIAL_LABEL`, `DECORATIVE_FINISH_TYPE_LABEL`, `SPEC_KEY_LABEL`, `specKeyLabel`. Kiểu `EdgeProfile`, `SipCoreMaterial`, `DecorativeFinishType` → `string`.
- Thêm `SPEC_OPTION_GROUPS`, `SpecOptionGroup`, `SPEC_OPTION_GROUP_LABEL` (tên nhóm vi + mô tả trường dùng), `SPEC_OPTION_CODE_MAX = 40`, `SPEC_OPTION_LABEL_MAX = 100`, `isValidSpecOptionCode(code)`, `specOptionCodeFrom(label)` ("Hèm âm dương" → `HEM_AM_DUONG`), kiểu `SpecOptionCms`, `SpecOptionInput`, `SpecOptionLabels = Partial<Record<SpecOptionGroup, Record<string, string>>>`, `optionLabel(labels, group, code)` (thiếu → trả chính mã), `SPEC_OPTION_FIELDS` (group → các đường dẫn trường trong `ProductInput` để kiểm lỗi).

## 2. API

`api/src/products/spec-options.*` (CMS, guard như `ProductTypesController`, route `products/spec-options`, đăng ký trước `ProductsController`):

| Endpoint | Quyền | Ghi chú |
| --- | --- | --- |
| `GET /products/spec-options` | ADMIN, EDITOR | Mọi nhóm, kèm nhãn vi/en, `usageCount` (số sản phẩm dùng, kể cả thùng rác), `version`. Sắp `group, sortOrder, id`. |
| `POST /products/spec-options` | ADMIN, EDITOR | `{ group, code?, isActive, labels: { vi, en? } }`; mã bỏ trống → sinh từ nhãn vi; trùng trong nhóm → 409 tiếng Việt. Xếp cuối nhóm. |
| `PUT /products/spec-options/order` | ADMIN, EDITOR | `{ group, ids }` — đủ id của nhóm, lệch → 409. SQL thô không đổi `updated_at`. |
| `PUT /products/spec-options/:id` | ADMIN, EDITOR | If-Match; sửa nhãn + bật/tắt. Body có `code` khác mã hiện tại → 400 "Không đổi được mã". |
| `DELETE /products/spec-options/:id` | ADMIN | `usageCount > 0` → 409 "Giá trị đang dùng ở N sản phẩm — tắt thay vì xoá". |

`usageCount`: một truy vấn SQL `UNION ALL` theo bảng cột ở trên, `COUNT(DISTINCT product_id)` theo `(group, code)`.

Ghi sản phẩm (`ProductsService.assertValid`): tải mã hợp lệ theo nhóm (mọi giá trị, kể cả đang tắt — sản phẩm cũ vẫn lưu được); mã không tồn tại trong nhóm → lỗi tại ô (`technicalSpec.crystalPhase`, `floor.edgeProfiles`, `decorative.options.2.finishType`…) "Giá trị không có trong danh mục thông số". DTO bỏ `@IsIn(...)` cố định, giữ `@IsString` + `@MaxLength(40)`.

Public: `ProductDetailPublic` thêm `optionLabels: SpecOptionLabels` — nhãn theo locale (fallback vi) cho mọi mã sản phẩm đó dùng. Cache theo sản phẩm như cũ; mọi thay đổi danh mục → `cache.invalidate(PRODUCTS_INVALIDATE)` (xoá prefix + revalidate tag `products`).

## 3. CMS

- Sidebar "Sản Phẩm MGO" thêm mục con **Danh Mục Thông Số** (`/admin/products/spec-options`).
- Màn: `AdminPage` / `AdminPageBand` / `AdminPageBody`, desktop. Cột trái: 11 nhóm (tên + số giá trị), deep link `?group=`. Cột phải: bảng giá trị của nhóm (▲▼, nhãn vi, nhãn en hoặc "Chưa có tên tiếng Anh", mã (font mono), số sản phẩm dùng, bật/tắt, sửa/xoá) + khung sửa (nhãn vi*, nhãn en, mã — chỉ sửa khi tạo, gợi ý tự sinh; công tắc hiển thị). Xoá khoá khi đang dùng (tooltip nêu số).
- Form sản phẩm: tải `GET /products/spec-options` một lần (chặn Lưu tới khi tải xong như danh sách loại); select / chips mỗi trường lấy giá trị đang bật của nhóm + giá trị hiện tại của sản phẩm (đánh dấu "(đang ẩn)"). Link "Quản lý danh mục" mở màn trên.

## 4. Web

`SpecSheet`, `ProductDetailSections` dùng `optionLabel(product.optionLabels, group, code)` thay hằng nhãn. Trang khác không đổi.

## Kiểm tra

shared test; api lint / test / build; fe lint (file của task) / build; `migrate diff --exit-code` = 0; smoke trang chi tiết sản phẩm có thông số hiện đúng nhãn như trước.
