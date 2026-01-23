import { Module } from '@nestjs/common';
import { SearchModule } from '../shared/search/search.module';
import { CategoriesModule } from '../studio/categories/categories.module';
import { EpisodesModule } from '../studio/episodes/episodes.module';
import { ProgramsModule } from '../studio/programs/programs.module';
import { IngestionService } from './ingestion.service';
import { DummyImporter } from './importers/dummy.importer';
import {
  CONTENT_IMPORTER,
  ImporterRegistry,
} from './importers/importer.registry';

@Module({
  imports: [ProgramsModule, EpisodesModule, CategoriesModule, SearchModule],
  providers: [
    IngestionService,
    ImporterRegistry,
    DummyImporter,
    { provide: CONTENT_IMPORTER, useExisting: DummyImporter },
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
