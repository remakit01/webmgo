import { Global, Module } from '@nestjs/common';
import { ContentCacheService } from './content-cache.service.js';

@Global()
@Module({ providers: [ContentCacheService], exports: [ContentCacheService] })
export class ContentCacheModule {}
