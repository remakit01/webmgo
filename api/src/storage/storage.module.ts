import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { ImageProcessorService } from './image-processor.service.js';

@Global()
@Module({
  providers: [StorageService, ImageProcessorService],
  exports: [StorageService, ImageProcessorService],
})
export class StorageModule {}
