import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MessagingModule } from '../messaging/messaging.module';
import { MeiliService } from './meili.service';
import { SearchIndexerConsumer } from './indexer.consumer';
import { SearchOutboxService } from './outbox.service';
import { SearchOutboxRelay } from './outbox.relay';

@Module({
  imports: [DatabaseModule, MessagingModule],
  providers: [
    MeiliService,
    SearchOutboxService,
    SearchOutboxRelay,
    SearchIndexerConsumer,
  ],
  exports: [MeiliService, SearchOutboxService],
})
export class SearchModule {}
