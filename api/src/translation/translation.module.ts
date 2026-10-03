import { Module } from '@nestjs/common';
import { TranslationController } from './translation.controller.js';
import { TranslationService } from './translation.service.js';

// Dịch tự động bằng LLM cho CMS — dùng chung cho mọi module nội dung (hero, banner, sản phẩm...)
@Module({ controllers: [TranslationController], providers: [TranslationService], exports: [TranslationService] })
export class TranslationModule {}
