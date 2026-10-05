// Nạp dữ liệu Tin tức ban đầu (10 bài từ trang tĩnh cũ). Dùng chung:
// - prisma/seed.ts (seed đầy đủ cho máy mới)
// - chạy riêng `pnpm --filter api db:seed:news` cho DB đang dùng: KHÔNG đụng tài khoản, banner, hero.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ConfigService } from '@nestjs/config';
import { readingMinutes, richDocFromParagraphs, toPlainText } from '@remak/shared/rich-content';
import { slugify } from '@remak/shared/slug';
import type { NewsCategoryColor } from '@remak/shared/contracts/news';
import { PrismaClient } from '../src/generated/prisma/client.js';
import configuration from '../src/config/configuration.js';
import { StorageService } from '../src/storage/storage.service.js';
import { ImageProcessorService } from '../src/storage/image-processor.service.js';
import { MediaService } from '../src/storage/media.service.js';
import { NEWS_COVER_PREFIX } from '../src/news/news.constants.js';
import { NEWS_ARTICLES, NEWS_CATEGORIES } from './seed-data/news.js';

// Chuyên mục Tin tức: màu token thương hiệu + tên/slug tiếng Anh (bài viết chỉ có bản tiếng Việt, dịch sau trong CMS)
const NEWS_CATEGORY_SEED: Record<string, { color: NewsCategoryColor; en: string }> = {
  'tieu-chuan-pccc': { color: 'orange', en: 'Fire Safety Standards' },
  'ky-thuat': { color: 'green', en: 'Material Engineering' },
  'thu-nghiem': { color: 'slate', en: 'Field Testing' },
  'huong-dan': { color: 'amber', en: 'Installation Guides' },
  'nghiem-thu': { color: 'blue', en: 'Acceptance Experience' },
};
const NEWS_IMAGE_DIR = fileURLToPath(new URL('../../fe/public', import.meta.url));

/** "15/09/2026" -> 08:00 giờ Việt Nam ngày đó */
const parseViDate = (date: string) => {
  const [d, m, y] = date.split('/').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 1, 0, 0));
};

/** Nhập 10 bài từ dữ liệu tĩnh cũ — chỉ khi chưa có bài nào, để không ghi đè nội dung đã chỉnh trong CMS. */
export async function seedNews(prisma: PrismaClient, media: MediaService) {
  if ((await prisma.newsPost.count()) > 0) {
    console.log('ℹ️  Tin tức đã có dữ liệu — bỏ qua seed tin tức');
    return;
  }

  const categoryIds = new Map<string, string>();
  for (const [index, { id: slug, label }] of NEWS_CATEGORIES.filter((c) => c.id !== 'all').entries()) {
    const seed = NEWS_CATEGORY_SEED[slug] ?? { color: 'green' as const, en: label };
    const category = await prisma.newsCategory.create({
      data: {
        color: seed.color,
        sortOrder: index,
        translations: {
          create: [
            { locale: 'vi', name: label, slug },
            { locale: 'en', name: seed.en, slug: slugify(seed.en) },
          ],
        },
      },
    });
    categoryIds.set(slug, category.id);
  }

  const authorIds = new Map<string, string>();
  for (const name of new Set(NEWS_ARTICLES.map((a) => a.author))) {
    authorIds.set(name, (await prisma.newsAuthor.create({ data: { name } })).id);
  }

  // Tag gộp theo slug (vd "MGO" và "mgo" là một tag)
  const tagIdBySlug = new Map<string, string>();
  for (const name of new Set(NEWS_ARTICLES.flatMap((a) => a.tags))) {
    const slug = slugify(name);
    if (!slug || tagIdBySlug.has(slug)) continue;
    const tag = await prisma.newsTag.create({ data: { translations: { create: { locale: 'vi', name, slug } } } });
    tagIdBySlug.set(slug, tag.id);
  }

  // Mỗi bài một bản ảnh riêng: xoá vĩnh viễn một bài không làm mất ảnh của bài khác
  for (const [index, article] of NEWS_ARTICLES.entries()) {
    const cover = await media.uploadImage(NEWS_COVER_PREFIX, await readFile(`${NEWS_IMAGE_DIR}${article.image}`));
    const content = richDocFromParagraphs(article.content);
    const contentText = toPlainText(content);
    const publishedAt = parseViDate(article.date);
    await prisma.newsPost.create({
      data: {
        categoryId: categoryIds.get(article.categorySlug)!,
        authorId: authorIds.get(article.author),
        isFeatured: index < 5,
        featuredOrder: index < 5 ? index : null,
        coverImageKey: cover.imageKey,
        coverImageUrl: cover.imageUrl,
        coverImages: cover.images as unknown as object,
        translations: {
          create: {
            locale: 'vi',
            status: 'PUBLISHED',
            publishedAt,
            firstPublishedAt: publishedAt,
            title: article.title,
            slug: article.slug,
            sapo: article.desc,
            content: content as unknown as object,
            contentText,
            readingMinutes: readingMinutes(contentText),
            coverAlt: article.title,
          },
        },
        tags: {
          create: [...new Set(article.tags.map((name) => tagIdBySlug.get(slugify(name))))]
            .filter((id): id is string => !!id)
            .map((tagId) => ({ tagId })),
        },
      },
    });
    console.log(`✅ Tin tức "${article.title}"`);
  }
}

// Chạy trực tiếp: tsx prisma/seed-news.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const storage = new StorageService(new ConfigService(configuration()));
  await storage.onModuleInit();
  await seedNews(prisma, new MediaService(storage, new ImageProcessorService()))
    .catch((e) => {
      console.error('❌ Seed tin tức lỗi:', e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
