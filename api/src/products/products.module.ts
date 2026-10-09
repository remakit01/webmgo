import { Module } from '@nestjs/common';
import { TranslationModule } from '../translation/translation.module.js';
import { ProductsPublicController } from './products-public.controller.js';
import { ProductTypesController } from './product-types.controller.js';
import { ProductsController } from './products.controller.js';
import { SpecOptionsController } from './spec-options.controller.js';
import { ProductsPublicService } from './products-public.service.js';
import { ProductTypesService } from './product-types.service.js';
import { ProductsService } from './products.service.js';
import { SpecOptionsService } from './spec-options.service.js';
import { ProductsTranslateService } from './products-translate.service.js';

@Module({
  imports: [TranslationModule],
  // Controller có tiền tố tĩnh ("products/public", "products/types", "products/spec-options") đứng trước để không bị "products/:id" che
  controllers: [ProductsPublicController, ProductTypesController, SpecOptionsController, ProductsController],
  providers: [ProductsPublicService, ProductTypesService, SpecOptionsService, ProductsService, ProductsTranslateService],
  exports: [ProductsService, ProductsTranslateService],
})
export class ProductsModule {}
