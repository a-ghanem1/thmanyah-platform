import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExploreSearchService } from './search.service';
import { SearchProgramsQueryDto } from './dto/search-programs.query.dto';

@ApiTags('Explore', 'explore/search')
@Controller('explore/search')
export class ExploreSearchController {
  constructor(private readonly searchService: ExploreSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search programs' })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchPrograms(@Query() query: SearchProgramsQueryDto) {
    return this.searchService.searchPrograms(query);
  }
}
