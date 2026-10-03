import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { ImageProcessorService } from './image-processor.service.js';
import { MediaService } from './media.service.js';

@Global()
@Module({
  providers: [StorageService, ImageProcessorService, MediaService],
  exports: [StorageService, ImageProcessorService, MediaService],
})
export class StorageModule {}
