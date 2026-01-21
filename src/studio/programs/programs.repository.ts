import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProgramDto) {
    return this.prisma.program.create({ data });
  }

  findAll() {
    return this.prisma.program.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.prisma.program.findUnique({ where: { id } });
  }

  findWithCategories(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    });
  }

  update(id: string, data: UpdateProgramDto) {
    return this.prisma.program.update({ where: { id }, data });
  }

  replaceCategories(programId: string, categoryIds: string[]) {
    return this.prisma.$transaction([
      this.prisma.programCategory.deleteMany({ where: { programId } }),
      this.prisma.programCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          programId,
          categoryId,
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  findCategoriesByIds(categoryIds: string[]) {
    return this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
  }

  remove(id: string) {
    return this.prisma.program.delete({ where: { id } });
  }
}
