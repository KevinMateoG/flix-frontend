import type {
  TmdbEpisode,
  TmdbMediaItem,
  TmdbRegionProviders,
} from '@/src/features/tmdb/domain/tmdb';

export interface BrowseGenre {
  id: string;
  name: string;
}

export const BROWSE_GENRES: BrowseGenre[] = [
  { id: 'all', name: 'All' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' },
  { id: '27', name: 'Horror' },
  { id: '99', name: 'Documentary' },
];

export interface BrowsePageData {
  genre: string;
  isDemo: boolean;
  region: string;
  results: TmdbMediaItem[];
}

export interface MovieDetailPageData {
  movie: TmdbMediaItem;
  providers?: TmdbRegionProviders;
  profileId?: string;
  isDemo: boolean;
  isPlayable: boolean;
}

export interface TvDetailPageData {
  tv: TmdbMediaItem;
  episodes: TmdbEpisode[];
  seasonNumber: number;
  providers?: TmdbRegionProviders;
  profileId?: string;
  isDemo: boolean;
  isPlayable: boolean;
}
