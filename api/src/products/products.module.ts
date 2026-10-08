import { Module } from '@nestjs/common';
import { ProductsPublicController } from './products-public.controller.js';
import { ProductTypesController } from './product-types.controller.js';
import { ProductsController } from './products.controller.js';
import { ProductsPublicService } from './products-public.service.js';
import { ProductTypesService } from './product-types.service.js';
import { ProductsService } from './products.service.js';

@Module({
  // Controller có tiền tố tĩnh ("products/public", "products/types") đứng trước để không bị "products/:id" che
  controllers: [ProductsPublicController, ProductTypesController, ProductsController],
  providers: [ProductsPublicService, ProductTypesService, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
