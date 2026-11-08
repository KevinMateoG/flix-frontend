import { env } from '@/src/features/common/config';
import { fetchClientApi } from '@/src/features/common/http';
import type {
  TmdbMediaItem,
  TmdbPaginatedResponse,
  TmdbRegionProviders,
  TmdbSeasonDetails,
} from '../domain/tmdb';

const BASE = env.TMDB_BASE_URL;
const KEY = env.TMDB_API_KEY;
const IMG = env.TMDB_IMAGE_BASE_URL;
const DEFAULT_LANGUAGE = 'en-US';

async function fetchTMDB<T = unknown>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('api_key', KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const tmdb = {
  trending: (
    mediaType: 'movie' | 'tv' | 'all' = 'all',
    timeWindow: 'day' | 'week' = 'week',
    language = DEFAULT_LANGUAGE,
  ) => fetchTMDB<TmdbPaginatedResponse>(`/trending/${mediaType}/${timeWindow}`, { language }),

  popular: (mediaType: 'movie' | 'tv', page = 1, region = 'US', language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbPaginatedResponse>(`/${mediaType}/popular`, {
      language,
      page: page.toString(),
      region,
    }),

  topRated: (mediaType: 'movie' | 'tv', page = 1, region = 'US', language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbPaginatedResponse>(`/${mediaType}/top_rated`, {
      language,
      page: page.toString(),
      region,
    }),

  discover: (params: Record<string, string>, language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbPaginatedResponse>('/discover/movie', {
      ...params,
      language,
      sort_by: 'popularity.desc',
    }),

  discoverTV: (params: Record<string, string>, language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbPaginatedResponse>('/discover/tv', {
      ...params,
      language,
      sort_by: 'popularity.desc',
    }),

  search: (query: string, page = 1, language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbPaginatedResponse>('/search/multi', {
      query,
      language,
      page: page.toString(),
      include_adult: 'false',
    }),

  movieDetails: (id: number, language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbMediaItem>(`/movie/${id}`, {
      language,
      append_to_response: 'credits,videos,watch/providers,recommendations',
    }),

  tvDetails: (id: number, language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbMediaItem>(`/tv/${id}`, {
      language,
      append_to_response: 'credits,videos,watch/providers,recommendations,aggregate_credits',
    }),

  seasonDetails: (tvId: number, seasonNumber: number, language = DEFAULT_LANGUAGE) =>
    fetchTMDB<TmdbSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`, { language }),

  providers: (mediaType: 'movie' | 'tv', id: number) =>
    fetchTMDB<{ results?: Record<string, TmdbRegionProviders> }>(
      `/${mediaType}/${id}/watch/providers`,
      {},
    ),

  image: (
    path: string | null | undefined,
    size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500',
  ) => (path ? `${IMG}/${size}${path}` : null),

  backdrop: (
    path: string | null | undefined,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280',
  ) => (path ? `${IMG}/${size}${path}` : null),
};

export async function searchContentClient(
  query: string,
  locale: string,
): Promise<TmdbMediaItem[]> {
  const data = await fetchClientApi<{ results?: TmdbMediaItem[] }>(
    `/api/search?q=${encodeURIComponent(query.trim())}&language=${encodeURIComponent(locale)}`,
  );
  return data?.results || [];
}
