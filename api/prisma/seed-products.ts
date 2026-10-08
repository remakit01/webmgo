// Nạp 6 dòng tấm MgO từ Catalogue (seed-data/products.ts). Dùng chung:
// - prisma/seed.ts (máy mới)
// - chạy riêng `pnpm --filter api db:seed:products` cho DB đang dùng: chỉ chèn khi CHƯA có sản phẩm nào,
//   không ghi đè dữ liệu đã chỉnh trong CMS, không đụng tài khoản / tin tức.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { fileURLToPath } from 'node:url';
import { richDocFromParagraphs } from '@remak/shared/rich-content';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { PRODUCTS } from './seed-data/products.js';

export async function seedProducts(prisma: PrismaClient) {
  if ((await prisma.product.count()) > 0) {
    console.log('ℹ️  Sản phẩm đã có dữ liệu — bỏ qua seed sản phẩm');
    return;
  }
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    for (const [i, p] of PRODUCTS.entries()) {
      const product = await tx.product.create({
        data: {
          productType: p.productType,
          tradeName: p.tradeName,
          isFeatured: p.isFeatured ?? false,
          sortOrder: i,
          translations: {
            create: {
              locale: 'vi',
              status: 'PUBLISHED',
              publishedAt: now,
              name: p.vi.name,
              shortName: p.vi.shortName,
              slug: p.vi.slug,
              tagline: p.vi.tagline,
              summary: p.vi.summary,
              description: richDocFromParagraphs(p.vi.description) as unknown as Prisma.InputJsonValue,
              highlights: p.vi.highlights,
              advantages: p.vi.advantages,
              seoTitle: p.vi.seoTitle ?? null,
              seoDescription: p.vi.seoDescription ?? p.vi.summary.slice(0, 160),
              coverAlt: p.vi.name,
            },
          },
          technicalSpec: { create: p.spec as Prisma.ProductTechnicalSpecCreateWithoutProductInput },
          variants: {
            create: p.variants.map((v, j) => ({
              thicknessMm: v.thicknessMm,
              widthMm: v.widthMm ?? 1220,
              lengthMm: v.lengthMm ?? 2440,
              weightKg: v.weightKg ?? null,
              densityKgM3: v.densityKgM3 ?? null,
              fireRatingMinMinutes: v.fireRatingMinMinutes ?? null,
              fireRatingMaxMinutes: v.fireRatingMaxMinutes ?? null,
              fireRatingLabel: v.fireRatingLabel ?? null,
              flexuralMinMpa: v.flexuralMinMpa ?? null,
              isPopular: v.isPopular ?? false,
              isDefault: v.isDefault ?? false,
              sortOrder: j,
              // Catalogue không có giá -> liên hệ báo giá (không xuất giá chưa xác nhận lên web)
              priceMode: 'CONTACT' as const,
              translations: v.recommendedUse ? { create: { locale: 'vi' as const, recommendedUse: v.recommendedUse } } : undefined,
            })),
          },
          sipSpec: p.sip ? { create: p.sip } : undefined,
          floorSpec: p.floor ? { create: p.floor } : undefined,
          decorativeSpec: p.decorative ? { create: { customPrintSupported: p.decorative.customPrintSupported } } : undefined,
        },
      });
      for (const [j, o] of (p.decorative?.options ?? []).entries()) {
        await tx.decorativeFinishOption.create({
          data: {
            productId: product.id,
            finishType: o.finishType,
            scratchResistance: o.scratchResistance ?? null,
            sortOrder: j,
            translations: {
              create: { locale: 'vi', name: o.name, description: o.description, patterns: o.patterns ?? [], suitableAreas: o.suitableAreas },
            },
          },
        });
      }
    }
  });
  console.log(`✅ Sản phẩm: nạp ${PRODUCTS.length} dòng tấm MgO (bản tiếng Việt, liên hệ báo giá)`);
}

// Chạy trực tiếp: tsx prisma/seed-products.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  await seedProducts(prisma)
    .catch((e) => {
      console.error('❌ Seed sản phẩm lỗi:', e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
