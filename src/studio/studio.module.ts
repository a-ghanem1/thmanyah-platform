import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { EpisodesModule } from './episodes/episodes.module';
import { ProgramsModule } from './programs/programs.module';

@Module({
  imports: [AuthModule, ProgramsModule, EpisodesModule, CategoriesModule],
})
export class StudioModule {}
