import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramCategoriesDto } from './dto/update-program-categories.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProgramsRepository } from './programs.repository';
import { SearchOutboxService } from '../../shared/search/outbox.service';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly repository: ProgramsRepository,
    private readonly outboxService: SearchOutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateProgramDto) {
    return this.prisma.$transaction(async (tx) => {
      const program = await this.repository.create(dto, tx);
      await this.outboxService.enqueueProgramUpsert(
        program.id,
        { action: 'create' },
        tx,
      );
      return program;
    });
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
    return this.prisma.$transaction(async (tx) => {
      const program = await this.repository.findById(id, tx);
      if (!program) {
        throw new NotFoundException('Program not found');
      }
      const updated = await this.repository.update(id, dto, tx);
      await this.outboxService.enqueueProgramUpsert(
        updated.id,
        { action: 'update' },
        tx,
      );
      return updated;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const program = await this.repository.findById(id, tx);
      if (!program) {
        throw new NotFoundException('Program not found');
      }
      const removed = await this.repository.remove(id, tx);
      await this.outboxService.enqueueProgramDelete(
        id,
        { action: 'delete' },
        tx,
      );
      return removed;
    });
  }

  async updateCategories(id: string, dto: UpdateProgramCategoriesDto) {
    return this.prisma.$transaction(async (tx) => {
      const program = await this.repository.findById(id, tx);
      if (!program) {
        throw new NotFoundException('Program not found');
      }
      const categories = await this.repository.findCategoriesByIds(
        dto.categoryIds,
        tx,
      );
      if (categories.length !== dto.categoryIds.length) {
        throw new NotFoundException('Category not found');
      }
      await this.repository.replaceCategories(id, dto.categoryIds, tx);
      await this.outboxService.enqueueProgramUpsert(
        id,
        { action: 'update-categories' },
        tx,
      );
      return this.repository.findWithCategories(id, tx);
    });
  }
}
