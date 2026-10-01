import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';

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
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
