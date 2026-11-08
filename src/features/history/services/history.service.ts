'use server';

import { fetchApi } from '@/src/features/common/http';
import type {
  SeasonEpisodeProgress,
  WatchHistoryItem,
  WatchProgressInput,
} from '../domain/history';

export async function updateWatchProgress({
  tmdbId,
  mediaType,
  title,
  posterPath,
  playbackId,
  seasonNumber,
  episodeNumber,
  progressSeconds,
  durationSeconds,
}: WatchProgressInput): Promise<void> {
  try {
    await fetchApi('/api/watch-history/update-progress', {
      method: 'POST',
      body: JSON.stringify({
        tmdbId,
        mediaType,
        title,
        posterPath,
        playbackId,
        seasonNumber,
        episodeNumber,
        progressSeconds,
        durationSeconds,
      }),
    });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    throw error;
  }
}

export async function getContinueWatching(
  _profileId: string,
  limit = 10,
): Promise<WatchHistoryItem[]> {
  try {
    const data = await fetchApi<WatchHistoryItem[]>(`/api/watch-history?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return [];
  }
}

export async function getSeasonWatchHistory(
  tmdbId: number,
  seasonNumber: number,
): Promise<SeasonEpisodeProgress[]> {
  try {
    const data = await fetchApi<SeasonEpisodeProgress[]>(
      `/api/watch-history/${tmdbId}/season/${seasonNumber}`,
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching season watch history:', error);
    return [];
  }
}
