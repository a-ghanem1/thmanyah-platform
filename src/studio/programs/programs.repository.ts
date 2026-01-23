import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  create(data: CreateProgramDto, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).program.create({ data });
  }

  findAll() {
    return this.prisma.program.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).program.findUnique({ where: { id } });
  }

  findWithCategories(id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).program.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    });
  }

  update(id: string, data: UpdateProgramDto, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).program.update({ where: { id }, data });
  }

  replaceCategories(
    programId: string,
    categoryIds: string[],
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return Promise.all([
        tx.programCategory.deleteMany({ where: { programId } }),
        tx.programCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            programId,
            categoryId,
          })),
          skipDuplicates: true,
        }),
      ]);
    }

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

  findCategoriesByIds(categoryIds: string[], tx?: Prisma.TransactionClient) {
    return this.getClient(tx).category.findMany({
      where: { id: { in: categoryIds } },
    });
  }

  remove(id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).program.delete({ where: { id } });
  }
}
