import { Module } from '@nestjs/common';
import { MeiliService } from './meili.service';
import { SearchOutboxService } from './outbox.service';
import { SearchOutboxWorker } from './outbox.worker';

@Module({
  providers: [MeiliService, SearchOutboxService, SearchOutboxWorker],
  exports: [MeiliService, SearchOutboxService],
})
export class SearchModule {}
