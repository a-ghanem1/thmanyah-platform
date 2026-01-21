import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { StudioApiKeyGuard } from '../security/studio-api-key.guard';
import { EpisodesController } from './episodes.controller';
import { EpisodesRepository } from './episodes.repository';
import { EpisodesService } from './episodes.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EpisodesController],
  providers: [EpisodesService, EpisodesRepository, StudioApiKeyGuard],
})
export class EpisodesModule {}
