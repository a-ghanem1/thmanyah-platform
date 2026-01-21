import { Injectable } from '@nestjs/common';
import { MeiliService } from '../../shared/search/meili.service';
import { SearchProgramsQueryDto } from './dto/search-programs.query.dto';

@Injectable()
export class ExploreSearchService {
  constructor(private readonly meiliService: MeiliService) {}

  searchPrograms(query: SearchProgramsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.meiliService.searchPrograms({
      q: query.q,
      page,
      limit,
      language: query.language,
      categorySlug: query.categorySlug,
    });
  }
}
