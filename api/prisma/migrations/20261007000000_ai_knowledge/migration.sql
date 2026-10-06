-- Kho "Kiến thức AI" + vector embedding cho trợ lý viết bài
CREATE TYPE "ai_knowledge_kind" AS ENUM ('PRODUCT', 'SPEC', 'CERTIFICATION', 'APPLICATION', 'PROJECT', 'FAQ', 'PROCESS', 'COMPANY', 'MARKET', 'OTHER');
CREATE TYPE "ai_knowledge_status" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ai_knowledge_origin" AS ENUM ('SEED', 'HUMAN', 'AI_WEB');

CREATE TABLE "ai_knowledge" (
    "id" TEXT NOT NULL,
    "kind" "ai_knowledge_kind" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source_url" TEXT,
    "source_title" TEXT,
    "status" "ai_knowledge_status" NOT NULL DEFAULT 'ACTIVE',
    "origin" "ai_knowledge_origin" NOT NULL DEFAULT 'HUMAN',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMPTZ(3),
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_knowledge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_knowledge_title_check" CHECK (char_length("title") BETWEEN 1 AND 200),
    CONSTRAINT "ai_knowledge_content_check" CHECK (char_length("content") BETWEEN 1 AND 4000),
    CONSTRAINT "ai_knowledge_source_url_check" CHECK ("source_url" IS NULL OR "source_url" ~ '^(https?://|/)')
);

CREATE INDEX "ai_knowledge_status_kind_idx" ON "ai_knowledge"("status", "kind");

CREATE TABLE "ai_embeddings" (
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "chunk" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "text_hash" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "vector" REAL[] NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_embeddings_pkey" PRIMARY KEY ("source_type", "source_id", "chunk", "model"),
    CONSTRAINT "ai_embeddings_source_type_check" CHECK ("source_type" IN ('knowledge', 'news'))
);
