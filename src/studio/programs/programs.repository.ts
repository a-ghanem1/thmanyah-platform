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

  update(id: string, data: UpdateProgramDto) {
    return this.prisma.program.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.program.delete({ where: { id } });
  }
}
