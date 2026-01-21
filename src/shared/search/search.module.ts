import { Module } from '@nestjs/common';
import { MeiliService } from './meili.service';

@Module({
  providers: [MeiliService],
  exports: [MeiliService],
})
export class SearchModule {}
