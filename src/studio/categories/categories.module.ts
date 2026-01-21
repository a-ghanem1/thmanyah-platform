import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { StudioApiKeyGuard } from '../security/studio-api-key.guard';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, StudioApiKeyGuard],
})
export class CategoriesModule {}
