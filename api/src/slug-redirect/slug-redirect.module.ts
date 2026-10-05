import { Global, Module } from '@nestjs/common';
import { SlugRedirectService } from './slug-redirect.service.js';

@Global()
@Module({ providers: [SlugRedirectService], exports: [SlugRedirectService] })
export class SlugRedirectModule {}
