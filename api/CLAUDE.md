# api/ — NestJS backend

Đọc kèm [../CLAUDE.md](../CLAUDE.md) (quy tắc kiến trúc chung).

## Stack & điểm dễ sai

- **NestJS 12, ESM thuần** (`"type": "module"`, `moduleResolution: nodenext`): import tương đối **phải có đuôi `.js`**, kể cả khi file nguồn là `.ts`:
  ```ts
  import { PrismaService } from '../prisma/prisma.service.js';
  ```
- **Prisma 7** với driver adapter `@prisma/adapter-pg`. Client được sinh ra ở `src/generated/prisma/` (gitignored) — import từ `../generated/prisma/client.js`, **không** import từ `@prisma/client`. Cấu hình datasource/seed nằm ở [prisma.config.ts](prisma.config.ts), không nằm trong `schema.prisma`.
- Sau khi sửa [prisma/schema.prisma](prisma/schema.prisma): `pnpm --filter api db:generate`, rồi `db:migrate` để tạo migration. Bảng đặt tên snake_case qua `@@map`.
- TypeScript 6, `strict: true`. Lint bằng **oxlint** (không phải ESLint), format bằng Prettier (`singleQuote`, `trailingComma: all`).

## Cấu trúc module

```
src/
  <feature>/                 # mỗi domain một module: <feature>.module/controller/service.ts + dto/
  auth/                      # đăng nhập, refresh, JWT strategy (cookie httpOnly)
  common/decorators/         # @Roles(), @CurrentUser()
  common/guards/             # JwtAuthGuard, RolesGuard
  config/configuration.ts    # map env → config object; đọc qua ConfigService
  prisma/  redis/            # PrismaService, RedisService (global module)
```

- Module mới: tạo trong `src/<feature>/`, đăng ký vào [src/app.module.ts](src/app.module.ts).
- **Dùng lại hạ tầng có sẵn, không viết lại** (mẫu đầy đủ: module [src/news/](src/news/)):
  - Phân trang: `PaginationQueryDto` ([common/pagination.dto.ts](src/common/pagination.dto.ts)) + `normalizePage`/`toPaginated` từ `@remak/shared/pagination`.
  - Khoá lạc quan bản ghi: `assertVersion` / `assertUpdated` / `versionOf` ([common/versioning.ts](src/common/versioning.ts)); site_settings dùng [common/site-settings.ts](src/common/site-settings.ts).
  - Validator: `@IsSlug`, `@IsSafeLink`, `@IsRichDoc` ([common/validators.ts](src/common/validators.ts)); slug không trùng: `resolveUniqueSlug` ([common/unique-slug.ts](src/common/unique-slug.ts)).
  - Cache public: `redis.cacheOrLoad(key, ttl, loader)`; sau khi ghi: `ContentCacheService.invalidate({ prefixes, keys, tags })`; job định kỳ: `redis.withLock(...)`.
  - Đổi slug nội dung đã đăng: `SlugRedirectService` (bảng chung `slug_redirects`, fe trả 301).
  - Ảnh trong nội dung rich text: `POST /media/images?scope=...` ([media/media.controller.ts](src/media/media.controller.ts)); thêm scope + prefix vào `PUBLIC_PREFIXES`.
  - Nội dung đa ngôn ngữ: bảng `<Entity>Translation` khoá `(entity_id, locale)`, slug unique `(locale, slug)`, enum `ContentLocale`/`PublishStatus` (xem [prisma/schema.prisma](prisma/schema.prisma)).
- Biến môi trường mới: thêm vào `configuration.ts` **và** [.env.example](.env.example). Đọc qua `ConfigService`, không đọc `process.env` rải rác trong service.

## Quy tắc khi viết API

- **Validation:** `ValidationPipe` global với `whitelist` + `forbidNonWhitelisted` + `transform`. Mọi body/query đều có DTO dùng `class-validator`; field không khai báo trong DTO sẽ bị từ chối.
- **Phân quyền:** endpoint ghi (CMS) dùng `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', 'EDITOR')`. Endpoint public cho site tách riêng (thường là `GET /<feature>/public`), chỉ trả dữ liệu đã publish.
- **Swagger:** gắn `@ApiTags`, `@ApiOperation({ summary: '...' })` (tiếng Việt) cho controller/route mới.
- **Lỗi:** dùng exception của Nest (`NotFoundException`, `BadRequestException`…) với message tiếng Việt — CMS hiển thị trực tiếp message này.
- **Cache Redis:** đọc cache trước, miss thì query DB rồi `set` với TTL. Mọi lời gọi Redis phải bọc `try/catch` — Redis lỗi thì log `warn` và fallback DB, **không** trả 500. Quy ước tên key và TTL: xem mục 3.2 trong [../fe/docs/ARCHITECTURE_3_TIER_PHASE_ROADMAP.md](../fe/docs/ARCHITECTURE_3_TIER_PHASE_ROADMAP.md).
- **Sau khi ghi dữ liệu:** xoá Redis key liên quan rồi gọi revalidate sang fe (tag phải có trong whitelist của `fe/src/app/api/revalidate`). Revalidate lỗi không được làm hỏng request ghi.
- **File upload:** lưu lên MinIO (S3 SDK), DB chỉ giữ URL/metadata.
- Không log password, token hay secret.

## Test

- Vitest: unit test `*.spec.ts` đặt cạnh file nguồn; e2e trong `test/` (`vitest.config.e2e.ts`).
- Viết test cho logic service (mock Prisma/Redis), nhất là nhánh fallback khi Redis lỗi.

```bash
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api build
```
