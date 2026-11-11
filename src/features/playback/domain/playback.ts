import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

export interface MuxPlayerProps {
  playbackId: string;
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  onEnded?: () => void;
  backUrl: string;
}

export interface YouTubePlayerProps {
  videoId: string;
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime?: number;
  backUrl: string;
}

export type WatchUrlParams = Record<string, string | number | undefined | null>;
