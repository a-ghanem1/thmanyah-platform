import { Injectable } from '@nestjs/common';
import { validateOrThrow } from '../../shared/validation/validate-or-throw';
import { CategoriesService } from '../../studio/categories/categories.service';
import { CreateCategoryDto } from '../../studio/categories/dto/create-category.dto';
import { CreateEpisodeDto } from '../../studio/episodes/dto/create-episode.dto';
import { EpisodesService } from '../../studio/episodes/episodes.service';
import { CreateProgramDto } from '../../studio/programs/dto/create-program.dto';
import { ProgramsService } from '../../studio/programs/programs.service';
import { SearchOutboxService } from '../../shared/search/outbox.service';
import { ImportResult, IngestionDomain } from '../ingestion.types';
import { ContentImporter } from './content-importer';

type PersistResult = {
  programId: string;
  episodeIds: string[];
  categoryIds: string[];
  indexingEnqueued: boolean;
};

@Injectable()
export abstract class BaseImporter<
  Request = unknown,
  Raw = unknown,
> implements ContentImporter<Request> {
  abstract source: string;

  constructor(
    protected readonly programsService: ProgramsService,
    protected readonly episodesService: EpisodesService,
    protected readonly categoriesService: CategoriesService,
    protected readonly outboxService: SearchOutboxService,
  ) {}

  async import(request: Request): Promise<ImportResult> {
    return this.runImport(request);
  }

  protected async runImport(request: Request): Promise<ImportResult> {
    const raw = await this.fetchRaw(request);
    const domain = await this.mapToDomain(raw);
    const validated = await this.validate(domain);
    const persisted = await this.persist(validated);
    await this.enqueueIndexing(persisted);

    return {
      source: this.source,
      programId: persisted.programId,
      episodeIds: persisted.episodeIds,
      categoryIds: persisted.categoryIds,
    };
  }

  protected abstract fetchRaw(request: Request): Promise<Raw>;
  protected abstract mapToDomain(raw: Raw): Promise<IngestionDomain>;

  protected async validate(domain: IngestionDomain): Promise<IngestionDomain> {
    const program = await validateOrThrow(CreateProgramDto, domain.program);
    const episodes = await this.validateMany(CreateEpisodeDto, domain.episodes);
    const categories = await this.validateMany(
      CreateCategoryDto,
      domain.categories,
    );

    return { program, episodes, categories };
  }

  protected async persist(domain: IngestionDomain): Promise<PersistResult> {
    const program = await this.programsService.create(domain.program);
    const categoryIds: string[] = [];

    if (domain.categories && domain.categories.length > 0) {
      for (const category of domain.categories) {
        const created = await this.categoriesService.create(category);
        categoryIds.push(created.id);
      }
      await this.programsService.updateCategories(program.id, { categoryIds });
    }

    const episodeIds: string[] = [];
    if (domain.episodes && domain.episodes.length > 0) {
      for (const episode of domain.episodes) {
        const created = await this.episodesService.create(program.id, episode);
        episodeIds.push(created.id);
      }
    }

    return {
      programId: program.id,
      episodeIds,
      categoryIds,
      indexingEnqueued: true,
    };
  }

  protected async enqueueIndexing(persisted: PersistResult): Promise<void> {
    if (persisted.indexingEnqueued) {
      return;
    }

    await this.outboxService.enqueueProgramUpsert(persisted.programId, {
      action: 'ingestion',
    });
  }

  private async validateMany<T>(
    type: new (...args: unknown[]) => T,
    items?: T[],
  ): Promise<T[] | undefined> {
    if (!items || items.length === 0) {
      return undefined;
    }

    const validated: T[] = [];
    for (const item of items) {
      validated.push(await validateOrThrow(type, item));
    }

    return validated;
  }
}
