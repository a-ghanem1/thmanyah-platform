import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class BrowseRepository {
  constructor(private readonly prisma: PrismaService) {}

  listPrograms({
    skip,
    take,
    language,
    categorySlug,
  }: {
    skip: number;
    take: number;
    language?: string;
    categorySlug?: string;
  }) {
    return this.prisma.program.findMany({
      where: {
        status: 'published',
        language,
        categories: categorySlug
          ? { some: { category: { slug: categorySlug } } }
          : undefined,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
    });
  }

  countPrograms({
    language,
    categorySlug,
  }: {
    language?: string;
    categorySlug?: string;
  }) {
    return this.prisma.program.count({
      where: {
        status: 'published',
        language,
        categories: categorySlug
          ? { some: { category: { slug: categorySlug } } }
          : undefined,
      },
    });
  }

  findProgramById(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  listEpisodesByProgram({
    programId,
    skip,
    take,
  }: {
    programId: string;
    skip: number;
    take: number;
  }) {
    return this.prisma.episode.findMany({
      where: { programId, program: { status: 'published' } },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
    });
  }

  countEpisodesByProgram(programId: string) {
    return this.prisma.episode.count({
      where: { programId, program: { status: 'published' } },
    });
  }

  findPublishedProgramById(id: string) {
    return this.prisma.program.findFirst({
      where: { id, status: 'published' },
    });
  }

  listCategories() {
    return this.prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }
}
