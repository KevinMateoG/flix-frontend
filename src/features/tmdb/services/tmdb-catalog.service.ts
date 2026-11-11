import { fetchApi } from '@/src/features/common/http';
import type { TmdbMediaItem, TmdbPaginatedResponse } from '../domain/tmdb';

/**
 * Server-side TMDB catalog access routed through the Flix backend.
 *
 * The backend removes titles that an admin has deactivated (playable_content.is_active = false),
 * so every public listing (home rows, browse, search, movie detail) must go through here instead
 * of calling TMDB directly. On backend failure we return empty results rather than falling back to
 * TMDB, otherwise deactivated titles would leak back into the UI.
 */

const EMPTY: TmdbPaginatedResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  return search.toString();
}

async function fetchList(endpoint: string): Promise<TmdbPaginatedResponse> {
  try {
    const data = await fetchApi<TmdbPaginatedResponse>(endpoint);
    return data && Array.isArray(data.results) ? data : EMPTY;
  } catch (error) {
    console.error(`Error fetching catalog list ${endpoint}:`, error);
    return EMPTY;
  }
}

export const tmdbCatalog = {
  trending: (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week', language = 'en-US') =>
    fetchList(`/api/tmdb/trending?${buildQuery({ type: mediaType, window: timeWindow, language })}`),

  popular: (mediaType: 'movie' | 'tv', page = 1, region = 'US', language = 'en-US') =>
    fetchList(`/api/tmdb/popular?${buildQuery({ type: mediaType, page, region, language })}`),

  topRated: (mediaType: 'movie' | 'tv', page = 1, region = 'US', language = 'en-US') =>
    fetchList(`/api/tmdb/top-rated?${buildQuery({ type: mediaType, page, region, language })}`),

  discover: (genre: string, page = 1, region = 'US', language = 'en-US') =>
    fetchList(`/api/tmdb/discover?${buildQuery({ genre, page, region, language })}`),

  search: (query: string, page = 1, language = 'en-US') =>
    fetchList(`/api/tmdb/search?${buildQuery({ q: query, page, language })}`),

  /** Returns null when the movie does not exist or was deactivated by an admin. */
  movieDetails: async (id: number, language = 'en-US'): Promise<TmdbMediaItem | null> => {
    try {
      const data = await fetchApi<TmdbMediaItem>(
        `/api/tmdb/movie/${id}?${buildQuery({ language })}`,
      );
      return data?.id ? data : null;
    } catch {
      return null;
    }
  },
};
