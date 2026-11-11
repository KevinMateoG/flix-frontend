import { cookies } from 'next/headers';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';
import { fetchApi } from '@/src/features/common/http';
import { tmdb } from './tmdb.service';
import type { PlayableContent, TmdbMediaItem, TmdbMediaType } from '../domain/tmdb';

export async function getUserRegion(profileRegion?: string | null): Promise<string | null> {
  if (profileRegion) return profileRegion;

  const profile = await getActiveProfile();
  if (profile?.region) return profile.region;

  try {
    const cookieStore = await cookies();
    const cookieRegion = cookieStore.get('user_region')?.value;
    if (cookieRegion) return cookieRegion;
  } catch {
    
  }

  return null;
}

export function isDemoModeActive(
  searchParams: { [key: string]: string | string[] | undefined } | null,
): boolean {
  if (!searchParams) return false;
  return searchParams.demoMode === 'all';
}

export async function getPlayableMoviesForRegion(region: string): Promise<PlayableContent[]> {
  try {
    const data = await fetchApi<PlayableContent[]>(
      `/api/movies?region=${encodeURIComponent(region)}`,
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function isTitlePlayableInRegion(
  tmdbId: number,
  region: string | null,
): Promise<boolean> {
  if (!region) return true;
  try {
    const data = await fetchApi<{ playable?: boolean }>(
      `/api/movies/${tmdbId}/playable?region=${encodeURIComponent(region)}`,
    );
    return !!data?.playable;
  } catch {
    return false;
  }
}

export async function fetchTmdbDetails(
  tmdbId: number,
  language?: string,
): Promise<(TmdbMediaItem & { media_type: TmdbMediaType }) | null> {
  const lang = language || 'en-US';
  try {
    const data = await fetchApi<TmdbMediaItem & { media_type: TmdbMediaType }>(
      `/api/tmdb/details/${tmdbId}?language=${encodeURIComponent(lang)}`,
    );
    if (data) return data;
  } catch {

  }

  try {
    const movie = await tmdb.movieDetails(tmdbId, lang);
    if (movie?.id) {
      return { ...movie, media_type: 'movie' };
    }
  } catch {

  }

  try {
    const tv = await tmdb.tvDetails(tmdbId, lang);
    if (tv?.id) {
      return { ...tv, media_type: 'tv' };
    }
  } catch {
    
  }

  return null;
}
