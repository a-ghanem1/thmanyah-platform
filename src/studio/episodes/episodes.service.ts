import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { EpisodesRepository } from './episodes.repository';

@Injectable()
export class EpisodesService {
  constructor(private readonly repository: EpisodesRepository) {}

  async create(programId: string, dto: CreateEpisodeDto) {
    const program = await this.repository.findProgramById(programId);
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    return this.repository.create(programId, dto);
  }

  findAllByProgram(programId: string) {
    return this.repository.findAllByProgram(programId);
  }

  async findOne(id: string) {
    const episode = await this.repository.findById(id);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return episode;
  }

  async update(id: string, dto: UpdateEpisodeDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
