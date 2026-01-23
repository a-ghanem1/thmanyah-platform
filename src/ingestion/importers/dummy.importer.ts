import { Injectable } from '@nestjs/common';
import { BaseImporter } from './base-importer';
import { IngestionDomain } from '../ingestion.types';
import { SearchOutboxService } from '../../shared/search/outbox.service';
import { CategoriesService } from '../../studio/categories/categories.service';
import { EpisodesService } from '../../studio/episodes/episodes.service';
import { ProgramsService } from '../../studio/programs/programs.service';

type DummyRawPayload = {
  title: string;
  language: string;
};

@Injectable()
export class DummyImporter extends BaseImporter<void, DummyRawPayload> {
  source = 'dummy';

  constructor(
    programsService: ProgramsService,
    episodesService: EpisodesService,
    categoriesService: CategoriesService,
    outboxService: SearchOutboxService,
  ) {
    super(programsService, episodesService, categoriesService, outboxService);
  }

  protected async fetchRaw(): Promise<DummyRawPayload> {
    await Promise.resolve();
    return {
      title: 'Dummy Program',
      language: 'en',
    };
  }

  protected async mapToDomain(raw: DummyRawPayload): Promise<IngestionDomain> {
    await Promise.resolve();
    const publishedAt = new Date().toISOString();

    return {
      program: {
        title: raw.title,
        description: 'Static dummy content for ingestion framework.',
        language: raw.language,
        status: 'published',
        publishedAt,
      },
      episodes: [
        {
          title: 'Dummy Episode',
          description: 'Static dummy episode.',
          durationSeconds: 300,
          publishedAt,
        },
      ],
    };
  }
}
