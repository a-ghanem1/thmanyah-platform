import { Injectable, NotFoundException } from '@nestjs/common';
import { BrowseRepository } from './browse.repository';
import { ListProgramsQueryDto } from './dto/list-programs.query.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class BrowseService {
  constructor(private readonly repository: BrowseRepository) {}

  async listPrograms(query: ListProgramsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.repository.countPrograms({
        language: query.language,
        categorySlug: query.categorySlug,
      }),
      this.repository.listPrograms({
        skip,
        take: limit,
        language: query.language,
        categorySlug: query.categorySlug,
      }),
    ]);

    return { page, limit, total, items };
  }

  async getProgram(id: string) {
    const program = await this.repository.findProgramById(id);
    if (!program || program.status !== 'published') {
      throw new NotFoundException('Program not found');
    }
    return {
      ...program,
      categories: program.categories.map((item) => item.category),
    };
  }

  async listEpisodes(programId: string, query: PaginationDto) {
    const program = await this.repository.findPublishedProgramById(programId);
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.repository.countEpisodesByProgram(programId),
      this.repository.listEpisodesByProgram({ programId, skip, take: limit }),
    ]);

    return { page, limit, total, items };
  }

  listCategories() {
    return this.repository.listCategories();
  }
}
