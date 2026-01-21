import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { EpisodesModule } from './episodes/episodes.module';
import { ProgramsModule } from './programs/programs.module';

@Module({
  imports: [ProgramsModule, EpisodesModule, CategoriesModule],
})
export class StudioModule {}
