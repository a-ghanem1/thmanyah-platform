import { ImportResult } from '../ingestion.types';

export interface ContentImporter<Request = unknown> {
  source: string;
  import(request: Request): Promise<ImportResult>;
}
