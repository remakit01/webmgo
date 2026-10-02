# CLAUDE.md — Website & CMS MGO Remak® FireOFF

Monorepo pnpm cho website giới thiệu tấm chống cháy MGO của Remak, kèm CMS quản trị.

| Package | Thư mục | Stack | Cổng dev |
| --- | --- | --- | --- |
| `mgo_remak` | [fe/](fe/) | Next.js 16 (App Router) + React 19 + Tailwind v4. Gồm site public **và** CMS tại `/admin` | 3000 |
| `api` | [api/](api/) | NestJS 12 (ESM) + Prisma 7 + PostgreSQL + Redis + MinIO | 4000 (Swagger: `/docs`) |

Quy tắc riêng từng package: [fe/CLAUDE.md](fe/CLAUDE.md), [api/CLAUDE.md](api/CLAUDE.md).

## Lệnh thường dùng

```bash
pnpm install                       # chạy ở root, KHÔNG dùng npm/yarn
docker compose up -d               # Postgres, Redis, MinIO, Mailpit (có giá trị mặc định trong docker-compose.yml)

pnpm dev:fe                        # Next.js  → http://localhost:3000
pnpm dev:api                       # NestJS   → http://localhost:4000

pnpm --filter mgo_remak lint
pnpm --filter mgo_remak build
pnpm --filter api lint             # oxlint --type-aware
pnpm --filter api test             # vitest (unit, *.spec.ts)
pnpm --filter api test:e2e
pnpm --filter api build
pnpm --filter api db:generate      # sinh Prisma client sau khi sửa schema
pnpm --filter api db:migrate       # tạo + áp migration
```

`dev:cms` / `build:cms` trong [package.json](package.json) là script cũ — CMS đã gộp vào `fe/src/app/admin`, không còn package `webmgo-cms`.

## Quy tắc kiến trúc bắt buộc

Chi tiết: [fe/docs/ARCHITECTURE_3_TIER_PHASE_ROADMAP.md](fe/docs/ARCHITECTURE_3_TIER_PHASE_ROADMAP.md) mục 2–3.

1. **Frontend chỉ gọi API.** Không cài/import Prisma, `pg` hay Redis trong `fe/`, kể cả Server Component / Route Handler.
2. **Không hardcode nội dung.** Tiêu đề, hình ảnh, thông số… đến từ DB qua API. Chỉ nhãn UI cố định ("Đang tải...") được nằm trong code. Dữ liệu tĩnh trong `fe/src/data/` là tạm thời, đang được chuyển dần sang API — không thêm nội dung mới vào đó khi đã có API tương ứng.
3. **Trang public dùng SSG/ISR (`revalidate ≤ 60s`)**, không CSR-only. Khi CMS lưu dữ liệu, API xoá Redis key liên quan rồi gọi `POST /api/revalidate` của fe (secret `REVALIDATE_SECRET_TOKEN`, phải trùng nhau ở hai bên) để revalidate theo tag.
4. **Một nguồn sự thật** cho thông số sản phẩm MGO (độ dày, EI, tỷ trọng, giá…): định nghĩa một lần trong DB, tái sử dụng cho trang chủ, trang sản phẩm, bảng so sánh, schema SEO.
5. **Redis chết không được làm sập hệ thống:** mọi lệnh Redis bọc `try/catch`, fallback xuống DB và log cảnh báo.
6. **Không commit `.env`.** Khi thêm biến môi trường, cập nhật `.env.example` tương ứng.

## Quy ước chung

- **Ngôn ngữ:** text hiển thị cho người dùng và comment trong code viết **tiếng Việt**; tên biến/hàm/file và commit message viết tiếng Anh.
- **TypeScript strict**, không dùng `any` khi có thể khai báo kiểu. Kiểu dữ liệu dùng chung của fe nằm ở `fe/src/types/`.
- Chỉ sửa đúng phạm vi task; không refactor/format lại file không liên quan.
- Không thêm dependency mới nếu chưa cần thiết; thêm thì dùng `pnpm --filter <package> add`.

## Git & Pull Request

- Nhánh tích hợp là **`dev`** — mọi PR merge vào `dev`, không push thẳng `dev`/`main`.
- Tên nhánh: `feature/<mo-ta-ngan>`, `fix/<...>`, `chore/<...>` (kebab-case, tiếng Anh).
- Commit theo Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `chore: ...`. Scope thường gặp: `admin`, `cms`, `api`, `auth`, `home`, `products`, `news`…
- Trước khi mở PR: chạy `lint` + `build` của package bị ảnh hưởng (và `test` nếu sửa `api/`).

## Tài liệu tham khảo

- [fe/docs/BRAND_DESIGN_SYSTEM.md](fe/docs/BRAND_DESIGN_SYSTEM.md): màu thương hiệu, quy tắc UI (light theme)
- [fe/docs/ROUTES_CONTENT_MAP.md](fe/docs/ROUTES_CONTENT_MAP.md): sơ đồ route & nội dung
- [fe/docs/HEADER_NAVIGATION_STRUCTURE.md](fe/docs/HEADER_NAVIGATION_STRUCTURE.md): cấu trúc menu
- [fe/docs/CONTENT_STRATEGY_MASTER.md](fe/docs/CONTENT_STRATEGY_MASTER.md): chiến lược nội dung/SEO
