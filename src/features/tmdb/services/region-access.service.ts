import { getActiveProfile } from '@/src/features/profile/services/profile.service';
import { fetchApi } from '@/src/features/common/http';
import type { PlayableContent, TmdbMediaItem, TmdbMediaType } from '../domain/tmdb';

export async function getUserRegion(): Promise<string> {
  const profile = await getActiveProfile();
  return profile?.region || 'US';
}

export function isDemoModeActive(
  searchParams: { [key: string]: string | string[] | undefined } | null,
): boolean {
  if (!searchParams) return false;
  return searchParams.demoMode === 'all';
}

export async function getPlayableMoviesForRegion(region: string): Promise<PlayableContent[]> {
  try {
    const data = await fetchApi<PlayableContent[] | { data?: PlayableContent[] }>(
      `/api/movies?region=${encodeURIComponent(region)}&limit=100`,
    );
    if (Array.isArray(data)) {
      return data;
    }
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching playable content for region:', error);
    return [];
  }
}

export async function isTitlePlayableInRegion(tmdbId: number, region: string): Promise<boolean> {
  try {
    const data = await fetchApi<{ playable?: boolean }>(
      `/api/movies/${tmdbId}/playable?region=${encodeURIComponent(region)}`,
    );
    return !!data?.playable;
  } catch (error) {
    console.error('Error checking title playability:', error);
    return false;
  }
}

export async function fetchTmdbDetails(
  tmdbId: number,
  language?: string,
): Promise<(TmdbMediaItem & { media_type: TmdbMediaType }) | null> {
  try {
    const data = await fetchApi<TmdbMediaItem & { media_type: TmdbMediaType }>(
      `/api/tmdb/details/${tmdbId}?language=${encodeURIComponent(language || 'en-US')}`,
    );
    return data || null;
  } catch (err) {
    console.error(`Error fetching TMDB details for ${tmdbId}:`, err);
    return null;
  }
}
