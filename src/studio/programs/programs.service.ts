import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramCategoriesDto } from './dto/update-program-categories.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramsRepository } from './programs.repository';
import { SearchOutboxService } from '../../shared/search/outbox.service';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly repository: ProgramsRepository,
    private readonly outboxService: SearchOutboxService,
  ) {}

  async create(dto: CreateProgramDto) {
    const program = await this.repository.create(dto);
    await this.outboxService.enqueueProgramUpsert(program.id, {
      action: 'create',
    });
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
    await this.outboxService.enqueueProgramUpsert(program.id, {
      action: 'update',
    });
    return program;
  }

  async remove(id: string) {
    await this.findOne(id);
    const program = await this.repository.remove(id);
    await this.outboxService.enqueueProgramDelete(id, { action: 'delete' });
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
    await this.outboxService.enqueueProgramUpsert(id, {
      action: 'update-categories',
    });
    return this.repository.findWithCategories(id);
  }
}
