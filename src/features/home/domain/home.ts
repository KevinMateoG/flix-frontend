import type { Messages } from '@/src/features/common/config';
import type { WatchHistoryItem } from '@/src/features/history/domain/history';
import type { TmdbMediaItem } from '@/src/features/tmdb/domain/tmdb';

export interface HomePageData {
  isDemo: boolean;
  region: string;
  profileId?: string;
  messages: Messages;
  continueWatching: WatchHistoryItem[];
  hero: TmdbMediaItem | null;
  regionalItems: TmdbMediaItem[];
  trending: TmdbMediaItem[];
  popularMovies: TmdbMediaItem[];
  popularTV: TmdbMediaItem[];
  topRated: TmdbMediaItem[];
}

export interface LandingFeatureItem {
  badge: string;
  title: string;
  description: string;
}

export interface LandingAudienceItem {
  role: string;
  title: string;
  description: string;
  highlights: string[];
}
