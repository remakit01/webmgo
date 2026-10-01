import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = 'Admin@123456';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const editorPassword = 'Editor@123456';
  const editorPasswordHash = await bcrypt.hash(editorPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@remak.vn' },
    update: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      username: 'admin',
      email: 'admin@remak.vn',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@remak.vn' },
    update: {
      username: 'editor',
      passwordHash: editorPasswordHash,
      role: Role.EDITOR,
    },
    create: {
      username: 'editor',
      email: 'editor@remak.vn',
      passwordHash: editorPasswordHash,
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
