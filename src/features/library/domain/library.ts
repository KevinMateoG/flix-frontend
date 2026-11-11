import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

export interface LibraryItem {
  id: number;
  profileId?: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  addedAt?: string;
}

export interface DetailedLibraryItem extends LibraryItem {
  title?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  overview?: string;
}

export interface ToggleLibraryPayload {
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
}

export interface ToggleLibraryResult {
  added: boolean;
}
