import { Module } from '@nestjs/common';
import { AiWriterController } from './ai-writer.controller.js';
import { AiWriterService } from './ai-writer.service.js';
import { AiKnowledgeModule } from '../ai-knowledge/ai-knowledge.module.js';

// Trợ lý viết bài bằng AI (GeminiService đến từ AiModule global; tra cứu kho kiến thức từ AiKnowledgeModule)
@Module({ imports: [AiKnowledgeModule], controllers: [AiWriterController], providers: [AiWriterService] })
export class AiWriterModule {}
