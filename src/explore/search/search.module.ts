import { Module } from '@nestjs/common';
import { CacheModule } from '../../shared/cache/cache.module';
import { SearchModule } from '../../shared/search/search.module';
import { ExploreSearchController } from './search.controller';
import { ExploreSearchService } from './search.service';

@Module({
  imports: [CacheModule, SearchModule],
  controllers: [ExploreSearchController],
  providers: [ExploreSearchService],
})
export class ExploreSearchModule {}
