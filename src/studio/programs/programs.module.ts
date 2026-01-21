import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { SearchModule } from '../../shared/search/search.module';
import { StudioApiKeyGuard } from '../security/studio-api-key.guard';
import { ProgramsController } from './programs.controller';
import { ProgramsRepository } from './programs.repository';
import { ProgramsService } from './programs.service';

@Module({
  imports: [DatabaseModule, SearchModule],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramsRepository, StudioApiKeyGuard],
})
export class ProgramsModule {}
