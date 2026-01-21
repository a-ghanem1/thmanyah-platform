import { Module } from '@nestjs/common';
import { BrowseModule } from './browse/browse.module';
import { ExploreSearchModule } from './search/search.module';

@Module({
  imports: [ExploreSearchModule, BrowseModule],
})
export class ExploreModule {}
