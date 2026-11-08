import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

export interface WatchHistoryItem {
  id: string;
  profileId?: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  title?: string | null;
  posterPath?: string | null;
  muxPlaybackId?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  progressSeconds: number;
  durationSeconds?: number | null;
  completed?: boolean;
  watchedAt?: string;
}

export interface WatchProgressInput {
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  title?: string;
  posterPath?: string;
  playbackId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
}

export interface SeasonEpisodeProgress {
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
}
