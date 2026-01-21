import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MeiliService } from './meili.service';
import { SearchOutboxService } from './outbox.service';
import { SearchOutboxWorker } from './outbox.worker';

@Module({
  imports: [DatabaseModule],
  providers: [MeiliService, SearchOutboxService, SearchOutboxWorker],
  exports: [MeiliService, SearchOutboxService],
})
export class SearchModule {}
