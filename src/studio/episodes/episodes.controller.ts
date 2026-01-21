import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { EpisodesService } from './episodes.service';

@ApiTags('Studio', 'studio/episodes')
@Controller('studio')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post('programs/:programId/episodes')
  @ApiOperation({ summary: 'Create an episode for a program' })
  @ApiParam({ name: 'programId', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Episode created' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  create(
    @Param('programId', new ParseUUIDPipe()) programId: string,
    @Body() dto: CreateEpisodeDto,
  ) {
    return this.episodesService.create(programId, dto);
  }

  @Get('programs/:programId/episodes')
  @ApiOperation({ summary: 'List episodes for a program' })
  @ApiParam({ name: 'programId', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Episode list' })
  findAllByProgram(@Param('programId', new ParseUUIDPipe()) programId: string) {
    return this.episodesService.findAllByProgram(programId);
  }

  @Get('episodes/:id')
  @ApiOperation({ summary: 'Get an episode' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Episode details' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.episodesService.findOne(id);
  }

  @Put('episodes/:id')
  @ApiOperation({ summary: 'Update an episode' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Episode updated' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEpisodeDto,
  ) {
    return this.episodesService.update(id, dto);
  }

  @Delete('episodes/:id')
  @ApiOperation({ summary: 'Delete an episode' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Episode deleted' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.episodesService.remove(id);
  }
}
