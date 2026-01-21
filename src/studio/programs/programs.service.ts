import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramCategoriesDto } from './dto/update-program-categories.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramsRepository } from './programs.repository';
import { MeiliService } from '../../shared/search/meili.service';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly repository: ProgramsRepository,
    private readonly meiliService: MeiliService,
  ) {}

  async create(dto: CreateProgramDto) {
    const program = await this.repository.create(dto);
    const programWithCategories = await this.repository.findWithCategories(
      program.id,
    );
    if (programWithCategories) {
      await this.meiliService.syncProgram(programWithCategories);
    }
    return program;
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const program = await this.repository.findById(id);
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    return program;
  }

  async update(id: string, dto: UpdateProgramDto) {
    await this.findOne(id);
    const program = await this.repository.update(id, dto);
    const programWithCategories = await this.repository.findWithCategories(
      program.id,
    );
    if (programWithCategories) {
      await this.meiliService.syncProgram(programWithCategories);
    }
    return program;
  }

  async remove(id: string) {
    await this.findOne(id);
    const program = await this.repository.remove(id);
    await this.meiliService.removeProgram(id);
    return program;
  }

  async updateCategories(id: string, dto: UpdateProgramCategoriesDto) {
    await this.findOne(id);
    const categories = await this.repository.findCategoriesByIds(
      dto.categoryIds,
    );
    if (categories.length !== dto.categoryIds.length) {
      throw new NotFoundException('Category not found');
    }
    await this.repository.replaceCategories(id, dto.categoryIds);
    const programWithCategories = await this.repository.findWithCategories(id);
    if (programWithCategories) {
      await this.meiliService.syncProgram(programWithCategories);
    }
    return programWithCategories;
  }
}
