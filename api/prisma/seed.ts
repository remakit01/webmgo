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
import { BannersService } from '../src/banners/banners.service.js';

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

  await seedBanners();
}

/** Chỉ nạp khi bảng banners trống, để không ghi đè dữ liệu đã chỉnh trong CMS. */
async function seedBanners() {
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

  // Dùng lại đúng luồng của API: sharp -> biến thể WebP/AVIF -> MinIO -> DB
  const storage = new StorageService(new ConfigService(configuration()));
  await storage.onModuleInit();
  const noop = async () => undefined;
  const banners = new BannersService(
    prisma as never,
    { get: async () => null, set: noop, del: noop } as never, // không cần cache Redis khi seed
    storage,
    new ImageProcessorService(),
    { trigger: noop } as never, // FE build sau sẽ lấy dữ liệu mới
  );

  for (const { file, ...data } of DEFAULT_BANNERS) {
    const buffer = await readFile(`${BANNER_IMAGE_DIR}${file}`);
    const banner = await banners.create(data, { buffer } as Express.Multer.File);
    console.log(`✅ Banner "${banner.title}" -> ${banner.imageUrl}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
