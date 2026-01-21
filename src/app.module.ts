import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExploreModule } from './explore/explore.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { DatabaseModule } from './shared/database/database.module';
import { SharedModule } from './shared/shared.module';
import { StudioModule } from './studio/studio.module';

@Module({
  imports: [
    StudioModule,
    ExploreModule,
    IngestionModule,
    SharedModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
