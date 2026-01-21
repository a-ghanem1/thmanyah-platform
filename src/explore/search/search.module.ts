import { Module } from '@nestjs/common';
import { SearchModule } from '../../shared/search/search.module';
import { ExploreSearchController } from './search.controller';
import { ExploreSearchService } from './search.service';

@Module({
  imports: [SearchModule],
  controllers: [ExploreSearchController],
  providers: [ExploreSearchService],
})
export class ExploreSearchModule {}
