import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BrowseService } from './browse.service';
import { ListProgramsQueryDto } from './dto/list-programs.query.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('Explore', 'explore/browse')
@Controller('explore')
export class BrowseController {
  constructor(private readonly browseService: BrowseService) {}

  @Get('programs')
  @ApiOperation({ summary: 'List programs' })
  @ApiResponse({ status: 200, description: 'Program list' })
  listPrograms(@Query() query: ListProgramsQueryDto) {
    return this.browseService.listPrograms(query);
  }

  @Get('programs/:id')
  @ApiOperation({ summary: 'Get program details' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Program details' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  getProgram(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.browseService.getProgram(id);
  }

  @Get('programs/:id/episodes')
  @ApiOperation({ summary: 'List program episodes' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Episode list' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  listEpisodes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.browseService.listEpisodes(id, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiResponse({ status: 200, description: 'Category list' })
  listCategories() {
    return this.browseService.listCategories();
  }
}
