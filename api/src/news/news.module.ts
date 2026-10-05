import { Module } from '@nestjs/common';
import { NewsPostsController } from './news-posts.controller.js';
import { NewsTaxonomyController } from './news-taxonomy.controller.js';
import { NewsPublicController } from './news-public.controller.js';
import { NewsPostsService } from './news-posts.service.js';
import { NewsTaxonomyService } from './news-taxonomy.service.js';
import { NewsPublicService } from './news-public.service.js';
import { NewsSchedulerService } from './news-scheduler.service.js';
import { NewsTranslateService } from './news-translate.service.js';
import { TranslationModule } from '../translation/translation.module.js';

@Module({
  imports: [TranslationModule],
  // NewsPublicController trước: route tĩnh "news/public/..." không bị "news/posts/:id" che
  controllers: [NewsPublicController, NewsTaxonomyController, NewsPostsController],
  providers: [NewsPostsService, NewsTaxonomyService, NewsPublicService, NewsSchedulerService, NewsTranslateService],
  exports: [NewsPostsService],
})
export class NewsModule {}
