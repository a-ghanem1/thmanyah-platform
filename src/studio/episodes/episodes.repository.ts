import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(programId: string, data: CreateEpisodeDto) {
    return this.prisma.episode.create({
      data: { ...data, programId },
    });
  }

  findAllByProgram(programId: string) {
    return this.prisma.episode.findMany({
      where: { programId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.episode.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateEpisodeDto) {
    return this.prisma.episode.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.episode.delete({ where: { id } });
  }

  findProgramById(id: string) {
    return this.prisma.program.findUnique({ where: { id } });
  }
}
