import { Module } from '@nestjs/common';
import { AiKnowledgeController } from './ai-knowledge.controller.js';
import { AiKnowledgeService } from './ai-knowledge.service.js';
import { AiIndexService } from './ai-index.service.js';
import { AiRetrieverService } from './ai-retriever.service.js';

// Kho "Kiến thức AI" + lập chỉ mục embedding + tra cứu lai cho trợ lý viết bài (GeminiService từ AiModule global)
@Module({
  controllers: [AiKnowledgeController],
  providers: [AiKnowledgeService, AiIndexService, AiRetrieverService],
  exports: [AiRetrieverService, AiKnowledgeService],
})
export class AiKnowledgeModule {}
