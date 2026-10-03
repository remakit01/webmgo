import { Module } from '@nestjs/common';
import { HeroController } from './hero.controller.js';
import { HeroService } from './hero.service.js';

// Các khối nội dung trang chủ (hero; sau này: lợi ích, FAQ...)
@Module({ controllers: [HeroController], providers: [HeroService], exports: [HeroService] })
export class HomepageModule {}
