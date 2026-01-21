import { Injectable } from '@nestjs/common';
import { CacheService } from '../../shared/cache/cache.service';
import { MeiliService } from '../../shared/search/meili.service';
import { SearchProgramsQueryDto } from './dto/search-programs.query.dto';

@Injectable()
export class ExploreSearchService {
  constructor(
    private readonly meiliService: MeiliService,
    private readonly cacheService: CacheService,
  ) {}

  async searchPrograms(query: SearchProgramsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const cacheKey = this.cacheService.buildKey('/explore/search', {
      q: query.q,
      page,
      limit,
      language: query.language,
      categorySlug: query.categorySlug,
    });

    return this.cacheService.getOrSet(cacheKey, 60, () =>
      this.meiliService.searchPrograms({
        q: query.q,
        page,
        limit,
        language: query.language,
        categorySlug: query.categorySlug,
      }),
    );
  }
}
