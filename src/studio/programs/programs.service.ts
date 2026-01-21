import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramCategoriesDto } from './dto/update-program-categories.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramsRepository } from './programs.repository';

@Injectable()
export class ProgramsService {
  constructor(private readonly repository: ProgramsRepository) {}

  create(dto: CreateProgramDto) {
    return this.repository.create(dto);
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
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
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
    return this.repository.findWithCategories(id);
  }
}
