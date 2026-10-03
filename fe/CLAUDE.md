# fe/ — Next.js (site public + CMS `/admin`)

Đọc kèm [../CLAUDE.md](../CLAUDE.md) (quy tắc kiến trúc chung).

## Next.js 16 khác với kiến thức cũ

Dự án dùng **Next.js 16.3 + React 19.2**. API, quy ước và cấu trúc file có thay đổi lớn so với Next 13–15. Trước khi dùng API của Next (caching, `revalidateTag`, `params`, route handler, metadata, `next/image`…), đọc tài liệu tương ứng trong `node_modules/next/dist/docs/` (`01-app/` cho App Router) và chú ý các cảnh báo deprecation. Không viết theo trí nhớ.

## Cấu trúc

```
src/
  app/                 # App Router — KHÔNG có app/layout.tsx; 2 root layout riêng:
    [locale]/          # Web khách hàng (vi/en). Thư mục tên tiếng Anh; URL theo ngôn ngữ khai báo ở i18n/routing.ts
    admin/             # CMS (client-side, cần đăng nhập) — root layout riêng, chỉ tiếng Việt, không i18n
    api/               # Route handlers (vd: /api/revalidate)
  i18n/                # next-intl: routing.ts (bảng URL vi/en), paths.ts, request.ts
  proxy.ts             # Định tuyến ngôn ngữ (Next 16: middleware -> proxy)
  cms/                 # Code riêng của CMS — import qua alias @cms/*
    components/  lib/
  components/
    <feature>/         # home, products, applications, projects, about, dealer, tech-library...
    layout/            # Header, Footer, AppShell, SearchModal
    shared/            # Component dùng nhiều trang (export qua index.ts)
    ui/                # Primitive nhỏ (SectionHeading, ScrollReveal)
  data/                # Dữ liệu tĩnh tạm thời — đang chuyển dần sang API
  hooks/  lib/  types/
```

- Alias: `@/*` → `src/*`, `@cms/*` → `src/cms/*`. Dùng alias thay cho đường dẫn tương đối dài.
- Thêm route public mới → tạo thư mục trong `app/[locale]/`, khai báo URL vi/en trong `pathnames` của [src/i18n/routing.ts](src/i18n/routing.ts) và cập nhật [docs/ROUTES_CONTENT_MAP.md](docs/ROUTES_CONTENT_MAP.md). Không dùng `rewrites`.

## Đa ngôn ngữ (next-intl)

- Tiếng Việt mặc định **không tiền tố** (`/san-pham`), tiếng Anh dưới `/en` (`/en/products`).
- **Link nội bộ ở web khách hàng:** dùng `Link` từ [@/components/ui/LocaleLink](src/components/ui/LocaleLink.tsx), href **viết bằng URL tiếng Việt** như cũ — tự đổi sang `/en/...` khi đang xem tiếng Anh. Không dùng `next/link` hay `<a href="/...">` cho link nội bộ; điều hướng bằng code thì bọc `toLocalePath()` ([src/i18n/paths.ts](src/i18n/paths.ts)).
- **Nhãn giao diện** (menu, nút, footer…) nằm trong `messages/vi.json` + `messages/en.json`, dùng `useTranslations` / `getTranslations`. Thêm key ở **cả hai** file; key được kiểm tra kiểu theo `vi.json`.
- **Nội dung** (tiêu đề, mô tả, thông số…) vẫn đến từ API/DB, không đưa vào messages.
- Page/layout Server Component trong `[locale]` phải gọi `setRequestLocale(locale)` để giữ SSG/ISR.
- Giai đoạn chuyển tiếp: trang `/en` đặt `noindex` (nội dung phần lớn còn tiếng Việt); chưa có `/en` trong sitemap/hreflang.

## Lấy dữ liệu

- **Trang public:** fetch API NestJS trong Server Component với `next: { revalidate: 60, tags: [...] }`. Base URL lấy từ `NEXT_PUBLIC_API_URL` (bỏ hậu tố `/api` nếu có). Gom các hàm fetch public vào một module trong `src/lib/` thay vì gọi `fetch` rải rác trong component.
- Lúc `next build` API có thể không chạy: chỉ khi `process.env.NEXT_PHASE === 'phase-production-build'` mới nuốt lỗi và trả fallback. Lúc runtime thì **ném lỗi** để Next giữ bản trang cũ, không render trang trống.
- Tag mới dùng cho revalidate phải được thêm vào whitelist của `/api/revalidate` và khớp tag mà API gửi.
- **CMS (`/admin`):** gọi API từ client, xác thực bằng **httpOnly cookie** (`credentials: 'include'`). Không lưu token trong `localStorage`/JS. Hiển thị lỗi API cho người dùng bằng tiếng Việt.
- Không bao giờ import Prisma, `pg`, Redis hay SDK S3 trong `fe/`.

## Component & React

- Mặc định là **Server Component**. Chỉ thêm `'use client'` cho phần cần state/hiệu ứng/event, và đẩy ranh giới client xuống lá nhỏ nhất có thể — không biến cả `page.tsx` public thành client component.
- Icon: `lucide-react`. Primitive có sẵn: `@base-ui/react`, `@radix-ui/react-slot`, `class-variance-authority`.
- Ghép class bằng `cn()` từ [src/lib/utils.ts](src/lib/utils.ts). Định dạng tiền/số dùng `formatVND()` / `formatNumber()` (locale `vi-VN`).
- Ảnh dùng `next/image` với `alt` tiếng Việt có nghĩa.

## Giao diện

- **Chỉ light theme.** Màu thương hiệu khai báo trong [src/app/globals.css](src/app/globals.css) và dùng qua Tailwind: `remak-green`, `remak-green-dark`, `remak-green-light`, `remak-orange`, `remak-orange-dark`, `remak-orange-light`. Không hardcode mã hex mới.
- Tỷ lệ màu 60-30-10 và quy tắc CTA/thẻ sản phẩm/bảng thông số: xem [docs/BRAND_DESIGN_SYSTEM.md](docs/BRAND_DESIGN_SYSTEM.md). Cam (`remak-orange`) dành cho CTA chính.
- Font: Be Vietnam Pro (`font-sans`). Layout phải ổn trên mobile (bắt đầu từ ~360px).

## Kiểm tra trước khi xong

```bash
pnpm --filter mgo_remak lint
pnpm --filter mgo_remak build
```

Với thay đổi UI, chạy `pnpm dev:fe` và kiểm tra trên trình duyệt (desktop + mobile) trước khi báo hoàn thành.
