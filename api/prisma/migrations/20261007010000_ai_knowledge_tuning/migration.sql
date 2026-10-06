-- Tối ưu kho "Kiến thức AI" theo truy vấn thực tế:
-- 1. Mọi truy vấn ai_embeddings đều lọc theo model trước (WHERE model = ... [AND source_type/source_id]) -> đưa model lên đầu PK
--    để dùng được index (thay vì quét cả bảng), không cần thêm index phụ.
ALTER TABLE "ai_embeddings" DROP CONSTRAINT "ai_embeddings_pkey";
ALTER TABLE "ai_embeddings" ADD CONSTRAINT "ai_embeddings_pkey" PRIMARY KEY ("model", "source_type", "source_id", "chunk");

-- 2. Người tạo / sửa kiến thức: khoá ngoại tới users (xoá user -> giữ kiến thức, để NULL) + index cột khoá ngoại
--    như news_posts (ON DELETE SET NULL phải tìm dòng theo cột này).
CREATE INDEX "ai_knowledge_created_by_id_idx" ON "ai_knowledge"("created_by_id");
CREATE INDEX "ai_knowledge_updated_by_id_idx" ON "ai_knowledge"("updated_by_id");
ALTER TABLE "ai_knowledge" ADD CONSTRAINT "ai_knowledge_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_knowledge" ADD CONSTRAINT "ai_knowledge_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
