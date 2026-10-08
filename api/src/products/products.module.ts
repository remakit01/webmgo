import { Module } from '@nestjs/common';
import { ProductsPublicController } from './products-public.controller.js';
import { ProductsController } from './products.controller.js';
import { ProductsPublicService } from './products-public.service.js';
import { ProductsService } from './products.service.js';

@Module({
  // ProductsPublicController trước: route tĩnh "products/public/..." không bị "products/:id" che
  controllers: [ProductsPublicController, ProductsController],
  providers: [ProductsPublicService, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
