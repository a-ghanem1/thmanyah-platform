import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramCategoriesDto } from './dto/update-program-categories.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramsService } from './programs.service';

@ApiTags('Studio', 'studio/programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('studio/programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Create a program' })
  @ApiResponse({ status: 201, description: 'Program created' })
  create(@Body() dto: CreateProgramDto) {
    return this.programsService.create(dto);
  }

  @Get()
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'List programs' })
  @ApiResponse({ status: 200, description: 'Program list' })
  findAll() {
    return this.programsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Get a program' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Program details' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programsService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Update a program' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Program updated' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.update(id, dto);
  }

  @Put(':id/categories')
  @Roles('admin', 'editor')
  @ApiOperation({ summary: 'Replace program categories' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Program categories updated' })
  @ApiResponse({ status: 404, description: 'Program or category not found' })
  updateCategories(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProgramCategoriesDto,
  ) {
    return this.programsService.updateCategories(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Program deleted' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programsService.remove(id);
  }
}
