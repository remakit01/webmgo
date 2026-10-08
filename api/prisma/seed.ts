import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ConfigService } from '@nestjs/config';
import configuration from '../src/config/configuration.js';
import { StorageService } from '../src/storage/storage.service.js';
import { ImageProcessorService } from '../src/storage/image-processor.service.js';
import { MediaService } from '../src/storage/media.service.js';
import { BannersService } from '../src/banners/banners.service.js';
import { HeroService, HERO_CONTENT_KEY } from '../src/homepage/hero.service.js';
import type { UpdateHeroDto } from '../src/homepage/dto/hero.dto.js';
import { seedNews } from './seed-news.js';
import { seedAiKnowledge } from './seed-ai-knowledge.js';
import { seedProducts } from './seed-products.js';

// Ảnh banner gốc dùng một lần để nạp dữ liệu ban đầu; sau đó quản lý qua CMS (ảnh nằm trong MinIO)
const BANNER_IMAGE_DIR = fileURLToPath(new URL('../../fe/public/images/banners/', import.meta.url));

const DEFAULT_BANNERS = [
  {
    file: 'banner-1-tam-op.png',
    title: 'Tấm ốp chống cháy MGO',
    alt: 'Tấm ốp chống cháy MGO - Nhanh chóng, Dễ dàng, Bền bỉ, Tiết kiệm năng lượng',
    linkUrl: '/san-pham/tam-mgo',
  },
  {
    file: 'banner-2-chiu-lua.png',
    title: 'Tấm chống cháy chịu lửa 3 giờ',
    alt: 'Tấm chống cháy chịu lửa 3 giờ - 100% không amiăng - Vật liệu không cháy',
    linkUrl: '/san-pham/tam-mgo',
  },
  {
    file: 'banner-3-lot-san.png',
    title: 'Tấm MGO lót sàn',
    alt: 'Tấm MGO lót sàn - Độ bền vượt trội và chi phí hiệu quả - Nền sàn hèm khóa độc đáo',
    linkUrl: '/giai-phap-ung-dung#san-mgo',
  },
];

// Nội dung hero ban đầu = đúng nội dung đang hiển thị trên web trước khi có CMS
const HERO_IMAGE_FILE = fileURLToPath(new URL('../../fe/public/images/mgo-mesh.jpg', import.meta.url));
const DEFAULT_HERO: UpdateHeroDto = {
  title: 'Tấm Chống Cháy MGO Remak®',
  subtitle: 'Bảo vệ kết cấu PCCC chuyên sâu',
  paragraphs: [
    'Khoáng vô cơ Magie Oxit chịu lửa **1.200°C**, kháng ẩm tuyệt đối và chống ăn mòn. Sản xuất từ MgO gốc Sulfate (MgSO₄) — loại bỏ hoàn toàn ăn mòn đinh vít và hiện tượng “chảy nước” mùa nồm ẩm.',
    'Nhẹ hơn Cemboard 30%, dễ cắt khoan, không chứa Amiăng, đạt kiểm định PCCC QCVN 06:2022/BXD cho ống gió, vách ngăn chống cháy, lót sàn chịu tải và lõi cửa thép.',
  ],
  primaryCta: { text: 'Nhận Mẫu Thử Miễn Phí', link: '/nhan-mau-thu' },
  secondaryCta: { text: 'Dự Toán Khối Lượng (m²)', link: '#du-toan-vat-tu' },
  stats: [
    { value: '1.200°C', label: 'Chịu nhiệt', sublabel: 'Chống cháy A1', accent: 'orange' },
    { value: '0%', label: 'Trương nở ẩm', sublabel: 'Kháng nước tuyệt đối', accent: 'green-dark' },
    { value: '-30%', label: 'Nhẹ hơn Cemboard', sublabel: 'Giảm tải kết cấu', accent: 'slate' },
    { value: 'Zero', label: 'Chloride', sublabel: '0% rỉ sét đinh vít', accent: 'green' },
  ],
  media: {
    frameTitle: 'Cấu Trúc Tấm MGO Thực Tế',
    badge: 'Công Nghệ Sulfate',
    alt: 'Tấm chống cháy MGO Remak kết cấu sợi lưới thủy tinh đa tầng',
  },
};

const DEFAULT_SWIPER = { autoPlayInterval: 3500, pauseOnHover: true, showDots: false };
const DEFAULT_TRASH_SETTINGS = { autoPurgeEnabled: true, retentionDays: 30 };

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminPassword = 'Admin@123456';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const editorPassword = 'Editor@123456';
  const editorPasswordHash = await bcrypt.hash(editorPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@remak.vn' },
    update: {
      username: 'admin',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      username: 'admin',
      email: 'admin@remak.vn',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@remak.vn' },
    update: {
      username: 'editor',
      password: editorPasswordHash,
      role: Role.EDITOR,
    },
    create: {
      username: 'editor',
      email: 'editor@remak.vn',
      password: editorPasswordHash,
      role: Role.EDITOR,
    },
  });

  console.log('----------------------------------------------------');
  console.log('✅ Database Seeded Successfully with Username & Email:');
  console.log(`- Admin:  Username: "${admin.username}" | Email: "${admin.email}" | Password: "${adminPassword}"`);
  console.log(`- Editor: Username: "${editor.username}" | Email: "${editor.email}" | Password: "${editorPassword}"`);
  console.log('----------------------------------------------------');

  const media = await createMediaService();
  await seedBanners(media);
  await seedHero(media);
  await seedNews(prisma, media);
  await seedAiKnowledge(prisma);
  await seedProducts(prisma);
}

// Dùng lại đúng luồng của API: sharp -> biến thể WebP/AVIF -> MinIO -> DB
async function createMediaService() {
  const storage = new StorageService(new ConfigService(configuration()));
  await storage.onModuleInit();
  return new MediaService(storage, new ImageProcessorService());
}

// Seed không cần cache Redis / revalidate FE (build FE sau sẽ lấy dữ liệu mới)
const noop = async () => undefined;
const noCache = { get: async () => null, getJson: async () => null, set: noop, setJson: noop, del: noop, delCache: noop } as never;
const noRevalidate = { trigger: noop } as never;

/** Chỉ nạp khi bảng banners trống, để không ghi đè dữ liệu đã chỉnh trong CMS. */
async function seedBanners(media: MediaService) {
  await prisma.siteSetting.upsert({
    where: { key: 'homepage.banner.swiper' },
    create: { key: 'homepage.banner.swiper', value: DEFAULT_SWIPER },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: 'banners.trash' },
    create: { key: 'banners.trash', value: DEFAULT_TRASH_SETTINGS },
    update: {},
  });

  if ((await prisma.banner.count()) > 0) {
    console.log('ℹ️  Banners đã có dữ liệu — bỏ qua seed banner');
    return;
  }

  const banners = new BannersService(prisma as never, noCache, media, noRevalidate);

  for (const { file, ...data } of DEFAULT_BANNERS) {
    const buffer = await readFile(`${BANNER_IMAGE_DIR}${file}`);
    const banner = await banners.create(data, { buffer } as Express.Multer.File);
    console.log(`✅ Banner "${banner.title}" -> ${banner.imageUrl}`);
  }
}

/** Chỉ nạp khi chưa có hero, để không ghi đè nội dung đã chỉnh trong CMS. */
async function seedHero(media: MediaService) {
  if (await prisma.siteSetting.findUnique({ where: { key: HERO_CONTENT_KEY } })) {
    console.log('ℹ️  Hero đã có dữ liệu — bỏ qua seed hero');
    return;
  }
  const hero = new HeroService(prisma as never, noCache, media, noRevalidate);
  await hero.update(DEFAULT_HERO);
  const withImage = await hero.updateImage({ buffer: await readFile(HERO_IMAGE_FILE) } as Express.Multer.File);
  console.log(`✅ Hero "${withImage.vi?.title}" -> ${withImage.image?.imageUrl}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
