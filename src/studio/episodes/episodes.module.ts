import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { EpisodesController } from './episodes.controller';
import { EpisodesRepository } from './episodes.repository';
import { EpisodesService } from './episodes.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [EpisodesController],
  providers: [EpisodesService, EpisodesRepository],
})
export class EpisodesModule {}
