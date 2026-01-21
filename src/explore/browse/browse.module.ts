import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { BrowseController } from './browse.controller';
import { BrowseRepository } from './browse.repository';
import { BrowseService } from './browse.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BrowseController],
  providers: [BrowseService, BrowseRepository],
})
export class BrowseModule {}
