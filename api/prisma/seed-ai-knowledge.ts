// Nạp kho "Kiến thức AI" ban đầu từ snapshot seed-data/ai-knowledge.json
// (sinh một lần từ dữ liệu tĩnh fe/src/data: sản phẩm, độ dày, giải pháp, dự án, FAQ, chứng nhận, so sánh vật liệu).
// - prisma/seed.ts (máy mới) gọi seedAiKnowledge
// - chạy riêng `pnpm --filter api db:seed:ai-knowledge` cho DB đang dùng: chỉ chèn khi kho trống, KHÔNG đụng tài khoản.
// Embedding được job AiIndexService tự lập sau (hoặc nút "Lập chỉ mục lại" trong CMS).
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AiKnowledgeKind } from '@remak/shared/contracts/ai-knowledge';
import { PrismaClient } from '../src/generated/prisma/client.js';

interface SeedEntry {
  kind: AiKnowledgeKind;
  title: string;
  content: string;
  tags: string[];
  sourceUrl: string | null;
  sourceTitle: string | null;
  pinned?: boolean;
}

export async function seedAiKnowledge(prisma: PrismaClient) {
  if ((await prisma.aiKnowledge.count()) > 0) {
    console.log('ℹ️  Kho kiến thức AI đã có dữ liệu — bỏ qua seed');
    return;
  }
  const file = fileURLToPath(new URL('./seed-data/ai-knowledge.json', import.meta.url));
  const entries = JSON.parse(await readFile(file, 'utf8')) as SeedEntry[];
  const now = new Date();
  await prisma.aiKnowledge.createMany({
    data: entries.map((e) => ({
      kind: e.kind,
      title: e.title.slice(0, 200),
      content: e.content.slice(0, 4000),
      tags: e.tags,
      sourceUrl: e.sourceUrl,
      sourceTitle: e.sourceTitle,
      pinned: e.pinned ?? false,
      origin: 'SEED' as const,
      verifiedAt: now,
    })),
  });
  console.log(`✅ Kiến thức AI: nạp ${entries.length} mẩu`);
}

// Chạy trực tiếp: tsx prisma/seed-ai-knowledge.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  await seedAiKnowledge(prisma)
    .catch((e) => {
      console.error('❌ Seed kiến thức AI lỗi:', e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
