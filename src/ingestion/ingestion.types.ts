import { CreateCategoryDto } from '../studio/categories/dto/create-category.dto';
import { CreateEpisodeDto } from '../studio/episodes/dto/create-episode.dto';
import { CreateProgramDto } from '../studio/programs/dto/create-program.dto';

export type ImportRequest = {
  source: string;
  payload?: unknown;
};

export type ImportResult = {
  source: string;
  programId: string;
  episodeIds: string[];
  categoryIds: string[];
};

export type IngestionDomain = {
  program: CreateProgramDto;
  episodes?: CreateEpisodeDto[];
  categories?: CreateCategoryDto[];
};
