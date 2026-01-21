import { Injectable, OnModuleInit } from '@nestjs/common';
import { Index, MeiliSearch } from 'meilisearch';

type ProgramSearchDocument = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  status: string;
  publishedAt: string | null;
  categories: string[];
  createdAt: string;
  updatedAt: string;
};

type ProgramWithCategories = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categories?: { category: { slug: string } }[];
};

@Injectable()
export class MeiliService implements OnModuleInit {
  private readonly client: MeiliSearch;

  constructor() {
    const host = process.env.MEILI_HOST ?? 'http://localhost:7700';
    const apiKey = process.env.MEILI_API_KEY;
    this.client = new MeiliSearch({ host, apiKey });
  }

  async onModuleInit(): Promise<void> {
    const index = await this.getProgramsIndex();
    await index.updateSettings({
      searchableAttributes: ['title', 'description'],
      filterableAttributes: ['language', 'categories', 'publishedAt'],
      sortableAttributes: ['publishedAt', 'createdAt'],
    });
  }

  async searchPrograms(params: {
    q: string;
    page: number;
    limit: number;
    language?: string;
    categorySlug?: string;
  }) {
    const offset = (params.page - 1) * params.limit;
    const filters: string[] = [];
    if (params.language) {
      filters.push(`language = "${params.language}"`);
    }
    if (params.categorySlug) {
      filters.push(`categories = "${params.categorySlug}"`);
    }

    const index = await this.getProgramsIndex();
    const result = await index.search<ProgramSearchDocument>(params.q, {
      offset,
      limit: params.limit,
      filter: filters.length ? filters : undefined,
      sort: ['publishedAt:desc', 'createdAt:desc'],
    });

    return {
      page: params.page,
      limit: params.limit,
      total: result.estimatedTotalHits ?? result.hits.length,
      items: result.hits,
    };
  }

  async syncProgram(program: ProgramWithCategories) {
    if (program.status !== 'published') {
      await this.removeProgram(program.id);
      return;
    }

    const document: ProgramSearchDocument = {
      id: program.id,
      title: program.title,
      description: program.description ?? null,
      language: program.language,
      status: program.status,
      publishedAt: program.publishedAt
        ? program.publishedAt.toISOString()
        : null,
      categories: program.categories?.map((item) => item.category.slug) ?? [],
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
    };

    const index = await this.getProgramsIndex();
    await index.addDocuments([document]);
  }

  async removeProgram(id: string) {
    const index = await this.getProgramsIndex();
    await index.deleteDocument(id);
  }

  private async getProgramsIndex(): Promise<Index> {
    try {
      return await this.client.getIndex('programs');
    } catch {
      await this.client.createIndex('programs', { primaryKey: 'id' });
      return this.client.index('programs');
    }
  }
}
