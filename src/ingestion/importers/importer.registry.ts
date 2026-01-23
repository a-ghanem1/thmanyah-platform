import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContentImporter } from './content-importer';

export const CONTENT_IMPORTER = 'CONTENT_IMPORTER';

@Injectable()
export class ImporterRegistry {
  constructor(
    @Inject(CONTENT_IMPORTER)
    private readonly importers: ContentImporter[],
  ) {}

  resolve(source: string): ContentImporter {
    const importer = this.importers.find((item) => item.source === source);
    if (!importer) {
      throw new NotFoundException(`Importer not found for source: ${source}`);
    }
    return importer;
  }
}
