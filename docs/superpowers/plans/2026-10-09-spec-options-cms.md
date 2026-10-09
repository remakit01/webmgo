# Danh mục thông số quản lý trong CMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 11 danh sách giá trị thông số (Kiểu cạnh, Màu lõi, Bề mặt, Bám vít, Pha tinh thể, VOC, Lớp phủ sàn, Vật liệu lõi SIP, Chịu lực, Loại hoàn thiện, Chống trầy) thành dữ liệu `spec_options` quản lý trong CMS.

**Architecture:** Một bảng chung `spec_options(group, code)` + `spec_option_translations(label vi/en)`. Cột sản phẩm lưu `code` dạng text / text[] (3 enum Postgres → text). API kiểm mã khi lưu sản phẩm, đếm sử dụng để chặn xoá; trang chi tiết nhận `optionLabels` theo locale.

**Tech Stack:** Prisma 7 + PostgreSQL, NestJS 12 ESM, vitest, Next.js 16, `@remak/shared`.

**Spec:** `docs/superpowers/specs/2026-10-09-spec-options-cms-design.md`

## Global Constraints

- Như plan Loại sản phẩm (`docs/superpowers/plans/2026-10-08-product-types-cms.md` mục Global Constraints): tiếng Việt cho text/comment, `.js` trong import api, Prisma client từ `src/generated`, `orderBy` kết thúc bằng `id`, Redis qua `cacheOrLoad`/`cache.invalidate`, fe chỉ gọi API, link nội bộ qua `LocaleLink`, CMS desktop với `AdminPage*`.
- Không sửa migration đã áp; không chạy `db:seed`; áp migration bằng `prisma migrate deploy` và kiểm `migrate diff --exit-code` = 0.
- Mã: `^[A-Z0-9]+(_[A-Z0-9]+)*$`, ≤ 40 ký tự, không đổi sau khi tạo.

## Review Focus

1. Mã cũ đang lưu ở sản phẩm (vd `TONGUE_GROOVE`, `PHASE_517`) sau migration hiện đúng nhãn cũ trên web — smoke trang chi tiết (Task 7).
2. Giá trị đang tắt mà sản phẩm cũ đang dùng: sản phẩm vẫn lưu được, CMS hiện "(đang ẩn)" — test service (Task 4).
3. Xoá giá trị đang dùng bị chặn, kể cả chỉ dùng trong mảng (`edge_profiles`, `core_materials`) hoặc sản phẩm trong thùng rác — test usage SQL (Task 3).
4. Mã trùng trong cùng nhóm → 409; cùng mã ở nhóm khác (`STANDARD` ở Bám vít và VOC) hợp lệ — test (Task 3).
5. Sửa nhãn danh mục → trang web cập nhật (cache products bị xoá) — test gọi `cache.invalidate` (Task 3).

---

### Task 1: Contract dùng chung

**Files:** `packages/shared/src/contracts/product.ts`, test `product.spec.ts`

**Produces:** `SPEC_OPTION_GROUPS` (11, thứ tự bảng spec), `SpecOptionGroup`, `SPEC_OPTION_GROUP_LABEL: Record<SpecOptionGroup, { name: string; fields: string }>` (vi), `SPEC_OPTION_CODE_MAX = 40`, `SPEC_OPTION_LABEL_MAX = 100`, `isValidSpecOptionCode(code): boolean`, `specOptionCodeFrom(label): string`, `SpecOptionCms { id; group; code; sortOrder; isActive; usageCount; version; labels: Partial<Record<Locale, string>> }`, `SpecOptionInput { group; code?: string; isActive: boolean; labels: { vi: string; en: string | null } }`, `SpecOptionLabels`, `optionLabel(labels, group, code): string`, `specOptionCodesOf(p: ProductInput): { group: SpecOptionGroup; path: string; code: string }[]` (mọi mã form đang dùng kèm đường dẫn lỗi). Xoá 11 mảng hằng + 4 bảng nhãn + `specKeyLabel`; `EdgeProfile`/`SipCoreMaterial`/`DecorativeFinishType` = `string`. `ProductDetailPublic.optionLabels: SpecOptionLabels`.

- [ ] Test RED: `specOptionCodeFrom('Hèm âm dương') === 'HEM_AM_DUONG'`, `specOptionCodeFrom('  Xám bê-tông 2 ') === 'XAM_BE_TONG_2'`; `isValidSpecOptionCode('PHASE_517')` true, `'phase'`/`'A__B'`/`''` false; `optionLabel({ CRYSTAL_PHASE: { PHASE_517: 'Pha 517' } }, 'CRYSTAL_PHASE', 'PHASE_517') === 'Pha 517'`, mã thiếu → trả mã; `specOptionCodesOf` trả `{ group: 'EDGE_PROFILE', path: 'floor.edgeProfiles', code: 'SHIPLAP' }` cho floor.edgeProfiles=['SHIPLAP'] và `decorative.options.0.finishType`.
- [ ] Implement; `pnpm --filter @remak/shared test` + build PASS.
- [ ] Commit `feat(shared): add spec option contracts`

### Task 2: Schema + migration

**Files:** `api/prisma/schema.prisma`, `api/prisma/migrations/20261012000000_spec_options/migration.sql`, `api/prisma/seed-data/products.ts` (kiểu), `api/prisma/seed-products.ts` nếu cần.

- [ ] Schema theo spec mục 1; enum cũ xoá; field thành `String?`/`String[]`.
- [ ] Migration: tạo enum group + 2 bảng + CHECK mã + index; INSERT nhãn hiện có (id cố định `so_<group>_<code>` viết thường); `ALTER COLUMN ... TYPE text USING ...::text` / `text[]`; `DROP TYPE` 3 enum.
- [ ] `prisma migrate deploy`; `migrate diff --exit-code` = 0; `db:generate`; SQL kiểm: số giá trị mỗi nhóm khớp số hằng cũ, cột sản phẩm giữ giá trị.
- [ ] Commit `feat(db): move spec value lists to spec_options`

### Task 3: API CRUD danh mục

**Files:** `api/src/products/spec-options.service.ts`, `.controller.ts`, `dto/spec-option.dto.ts`, test `spec-options.service.spec.ts`, `products.module.ts`.

**Produces:** `SpecOptionsService.list(): SpecOptionCms[]`, `create`, `update(id, dto, ifMatch)`, `reorder(group, ids)`, `remove(id)`, `codesByGroup(): Map<SpecOptionGroup, Set<string>>`, `labelsFor(locale, used: {group, code}[]): SpecOptionLabels`. Usage: một `$queryRaw` UNION ALL trả `(group, code, n)`.

- [ ] Test RED: remove khi usage>0 → 409 "Giá trị đang dùng ở 3 sản phẩm — tắt thay vì xoá", không xoá; create mã trùng trong nhóm → 409; create không mã → mã sinh từ nhãn vi; update đổi mã → 400 "Không đổi được mã"; reorder lệch → 409; mọi ghi gọi `cache.invalidate(PRODUCTS_INVALIDATE)`; SQL usage có đủ 5 bảng (kiểm chuỗi query chứa `edge_profiles`, `core_materials`, `suitable_floorings`, `finish_type`, `scratch_resistance`) và không lọc `deleted_at`.
- [ ] Implement; test PASS.
- [ ] Commit `feat(api): add spec option CRUD endpoints`

### Task 4: API sản phẩm kiểm mã + nhãn công khai

**Files:** `products.service.ts`, `products-public.service.ts`, `products.mapper.ts`, `dto/product-input.dto.ts`, tests.

- [ ] Test RED: create với `technicalSpec.crystalPhase = 'XYZ'` → 400 lỗi tại `technicalSpec.crystalPhase` "Giá trị không có trong danh mục thông số"; mã đang tắt vẫn lưu được; bySlug trả `product.optionLabels.CRYSTAL_PHASE.PHASE_517` theo locale (fallback vi).
- [ ] Implement (DTO bỏ `@IsIn` cố định → `@IsString @MaxLength(40)`; ProductsService inject SpecOptionsService).
- [ ] `pnpm --filter api test/lint/build` PASS.
- [ ] Commit `feat(api): validate product spec values against spec options`

### Task 5: CMS màn Danh Mục Thông Số

**Files:** `fe/src/app/admin/products/spec-options/page.tsx`, `fe/src/cms/components/products/spec-options/*`, `fe/src/cms/lib/products-api.ts`, `AdminSidebar.tsx`.

- [ ] Implement theo spec mục 3 (mẫu `/admin/products/types`); eslint file mới sạch, tsc sạch.
- [ ] Commit `feat(cms): add spec options management screen`

### Task 6: CMS form sản phẩm dùng danh mục

**Files:** `ProductEditor.tsx`, `ProductSpecSection.tsx`, `ProductExtensionSection.tsx`.

- [ ] Tải danh mục cùng lúc với loại; chặn Lưu tới khi có cả hai; options = đang bật + giá trị hiện tại "(đang ẩn)"; link "Quản lý danh mục".
- [ ] eslint/tsc sạch. Commit `feat(cms): use spec options in product form`

### Task 7: Web

**Files:** `SpecSheet.tsx`, `ProductDetailSections.tsx`, trang chi tiết truyền `optionLabels`.

- [ ] Implement; fe build PASS; smoke trang chi tiết (nhãn "Hèm khoá…", "Pha tinh thể 517" hiện như trước).
- [ ] Commit `feat(products): show spec option labels from CMS`

### Task 8: Kiểm tra toàn bộ + review độc lập + sửa Critical/Important.
