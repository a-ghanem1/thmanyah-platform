import { Module } from '@nestjs/common';
import { BrowseModule } from './browse/browse.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [SearchModule, BrowseModule],
})
export class ExploreModule {}
