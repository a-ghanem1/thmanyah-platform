import { Injectable } from '@nestjs/common';
import { ImportResult } from './ingestion.types';
import { ImporterRegistry } from './importers/importer.registry';

@Injectable()
export class IngestionService {
  constructor(private readonly registry: ImporterRegistry) {}

  importFrom(source: string, request?: unknown): Promise<ImportResult> {
    const importer = this.registry.resolve(source);
    return importer.import(request);
  }
}
