export type TmdbMediaType = 'movie' | 'tv';

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbVideo {
  id?: string;
  key: string;
  name?: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  roles?: Array<{ character: string }>;
  profile_path: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  runtime?: number | null;
  air_date?: string | null;
}

export interface TmdbSeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

export interface TmdbSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episodes: TmdbEpisode[];
}

export interface TmdbWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TmdbRegionProviders {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}

export interface TmdbMediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: TmdbMediaType | 'person';
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  genres?: TmdbGenre[];
  seasons?: TmdbSeasonSummary[];
  videos?: {
    results?: TmdbVideo[];
  };
  credits?: {
    cast?: TmdbCastMember[];
    crew?: TmdbCrewMember[];
  };
  aggregate_credits?: {
    cast?: TmdbCastMember[];
    crew?: TmdbCrewMember[];
  };
  recommendations?: {
    results?: TmdbMediaItem[];
  };
  'watch/providers'?: {
    results?: Record<string, TmdbRegionProviders>;
  };
}

export interface TmdbPaginatedResponse<T = TmdbMediaItem> {
  page?: number;
  results: T[];
  total_pages?: number;
  total_results?: number;
}

export interface PlayableContent {
  tmdbId: number;
  muxPlaybackId: string | null;
  muxAssetId: string | null;
  availableRegions: string[];
}
