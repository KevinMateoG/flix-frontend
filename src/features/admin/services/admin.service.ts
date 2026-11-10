import { fetchClientApi } from '@/src/features/common/http';
import type { TmdbMediaItem, TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';
import {
  DEFAULT_MUX_HLS_PLAYBACK_ID,
  type AdminMovieQuery,
  type AdminMovieRecord,
  type AdminUserQuery,
  type AdminUserRecord,
  type CreateAdminMovieInput,
  type PaginatedResponse,
  type TmdbPlaybackHelperResult,
  type TmdbSearchCandidate,
  type UpdateAdminMovieInput,
  type UpdateAdminUserInput,
} from '../domain/admin';

interface RawPlayableContent {
  tmdbId: number;
  muxPlaybackId: string;
  muxAssetId: string | null;
  availableRegions: string[] | null;
  isActive?: boolean;
}

function normalizeAssetId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;
  return trimmed;
}

const tmdbMetadataCache = new Map<
  number,
  {
    title?: string;
    posterPath?: string | null;
    releaseYear?: string | null;
    mediaType?: TmdbMediaType;
  }
>();

async function resolveMovieMetadata(tmdbId: number) {
  const cached = tmdbMetadataCache.get(tmdbId);
  if (cached) return cached;

  try {
    const details = await fetchClientApi<TmdbMediaItem & { media_type?: TmdbMediaType }>(
      `/api/tmdb/details/${tmdbId}`,
    );
    const title = details.title || details.name || `TMDB #${tmdbId}`;
    const rawDate = details.release_date || details.first_air_date || '';
    const releaseYear = rawDate ? rawDate.slice(0, 4) : null;
    const resolved = {
      title,
      posterPath: details.poster_path ?? null,
      releaseYear,
      mediaType: details.media_type ?? (details.first_air_date ? 'tv' : 'movie'),
    };
    tmdbMetadataCache.set(tmdbId, resolved);
    return resolved;
  } catch {
    const fallback = {
      title: `TMDB #${tmdbId}`,
      posterPath: null,
      releaseYear: null,
      mediaType: undefined,
    };
    return fallback;
  }
}

export async function getAdminMovies(
  query: AdminMovieQuery = {},
): Promise<PaginatedResponse<AdminMovieRecord>> {
  const params = new URLSearchParams();
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 8));
  if (query.status) {
    params.set('status', query.status);
  } else {
    params.set('status', 'all');
  }
  if (query.region && query.region !== 'ALL') {
    params.set('region', query.region);
  }
  if (query.search && query.search.trim().length > 0) {
    params.set('search', query.search.trim());
  }

  let response: PaginatedResponse<RawPlayableContent>;
  try {
    response = await fetchClientApi<PaginatedResponse<RawPlayableContent>>(
      `/api/admin/movies?${params.toString()}`,
    );
  } catch {
    response = await fetchClientApi<PaginatedResponse<RawPlayableContent>>(
      `/api/movies?${params.toString()}`,
    );
  }

  const rawItems = Array.isArray(response?.data) ? response.data : [];
  const enriched = await Promise.all(
    rawItems.map(async (item): Promise<AdminMovieRecord> => {
      const meta = await resolveMovieMetadata(item.tmdbId);
      return {
        tmdbId: item.tmdbId,
        muxPlaybackId: item.muxPlaybackId,
        muxAssetId: normalizeAssetId(item.muxAssetId),
        availableRegions: Array.isArray(item.availableRegions) ? item.availableRegions : ['US'],
        isActive: item.isActive ?? true,
        ...meta,
      };
    }),
  );

  return {
    data: enriched,
    pagination: response?.pagination ?? {
      total: enriched.length,
      currentPage: query.page ?? 1,
      limit: query.limit ?? 8,
      totalPages: 1,
    },
  };
}

export async function createAdminMovie(input: CreateAdminMovieInput): Promise<AdminMovieRecord> {
  const created = await fetchClientApi<RawPlayableContent>('/api/movies', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const meta = await resolveMovieMetadata(created.tmdbId);
  return {
    tmdbId: created.tmdbId,
    muxPlaybackId: created.muxPlaybackId,
    muxAssetId: normalizeAssetId(created.muxAssetId),
    availableRegions: Array.isArray(created.availableRegions) ? created.availableRegions : ['US'],
    isActive: created.isActive ?? true,
    ...meta,
  };
}

export async function updateAdminMovie(
  tmdbId: number,
  input: UpdateAdminMovieInput,
): Promise<AdminMovieRecord> {
  const updated = await fetchClientApi<RawPlayableContent>(`/api/movies/${tmdbId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  const meta = await resolveMovieMetadata(updated.tmdbId);
  return {
    tmdbId: updated.tmdbId,
    muxPlaybackId: updated.muxPlaybackId,
    muxAssetId: normalizeAssetId(updated.muxAssetId),
    availableRegions: Array.isArray(updated.availableRegions) ? updated.availableRegions : ['US'],
    isActive: updated.isActive ?? true,
    ...meta,
  };
}

export async function deleteAdminMovie(tmdbId: number): Promise<{ success: boolean }> {
  return fetchClientApi<{ success: boolean }>(`/api/movies/${tmdbId}`, {
    method: 'DELETE',
  });
}

export async function resolveTmdbPlaybackHelper(
  tmdbId: number,
  preferredMediaType?: TmdbMediaType,
): Promise<TmdbPlaybackHelperResult> {
  const detailsEndpoint = preferredMediaType
    ? `/api/tmdb/${preferredMediaType}/${tmdbId}`
    : `/api/tmdb/details/${tmdbId}`;

  const [existingPlayback, details] = await Promise.all([
    fetchClientApi<RawPlayableContent>(`/api/movies/${tmdbId}/playback`).catch(() => null),
    fetchClientApi<TmdbMediaItem & { media_type?: TmdbMediaType }>(detailsEndpoint).catch(() =>
      preferredMediaType
        ? fetchClientApi<TmdbMediaItem & { media_type?: TmdbMediaType }>(
            `/api/tmdb/details/${tmdbId}`,
          ).catch(() => null)
        : null,
    ),
  ]);

  const title = details?.title || details?.name || `TMDB #${tmdbId}`;
  const rawDate = details?.release_date || details?.first_air_date || '';
  const releaseYear = rawDate ? rawDate.slice(0, 4) : null;
  const mediaType: TmdbMediaType =
    preferredMediaType ?? details?.media_type ?? (details?.first_air_date ? 'tv' : 'movie');

  if (details) {
    tmdbMetadataCache.set(tmdbId, {
      title,
      posterPath: details.poster_path ?? null,
      releaseYear,
      mediaType,
    });
  }

  const youtubeVideos = (details?.videos?.results || []).filter(
    (v) => v.site?.toLowerCase() === 'youtube' && Boolean(v.key),
  );
  const bestTrailer =
    youtubeVideos.find((v) => v.type?.toLowerCase() === 'trailer' && v.official) ||
    youtubeVideos.find((v) => v.type?.toLowerCase() === 'trailer') ||
    youtubeVideos.find((v) => v.type?.toLowerCase() === 'teaser') ||
    youtubeVideos[0];

  const trailerPlaybackId = bestTrailer?.key ? `youtube:${bestTrailer.key}` : null;

  const providerRegions = Object.keys(details?.['watch/providers']?.results || {})
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z]{2}$/.test(code));

  const existingRegions =
    Array.isArray(existingPlayback?.availableRegions) &&
    existingPlayback.availableRegions.length > 0
      ? existingPlayback.availableRegions
      : null;

  const availableRegions =
    existingRegions ?? (providerRegions.length > 0 ? providerRegions : ['US', 'CO', 'MX', 'ES']);

  const existingMuxId = existingPlayback?.muxPlaybackId?.trim() || null;
  const muxPlaybackId = existingMuxId || DEFAULT_MUX_HLS_PLAYBACK_ID;
  const source: TmdbPlaybackHelperResult['source'] = existingMuxId
    ? 'catalog'
    : 'mux_default';

  return {
    tmdbId,
    title,
    releaseYear,
    mediaType,
    muxPlaybackId,
    muxAssetId: normalizeAssetId(existingPlayback?.muxAssetId),
    trailerPlaybackId,
    defaultMuxPlaybackId: DEFAULT_MUX_HLS_PLAYBACK_ID,
    availableRegions,
    source,
  };
}

export async function searchTmdbForAdmin(query: string): Promise<TmdbSearchCandidate[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const data = await fetchClientApi<{ results?: TmdbMediaItem[] }>(
    `/api/tmdb/search?q=${encodeURIComponent(trimmed)}`,
  );
  const results = Array.isArray(data?.results) ? data.results : [];

  return results
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type)
    .slice(0, 6)
    .map((item) => {
      const mediaType: TmdbMediaType =
        item.media_type === 'tv' || (!item.title && item.name) ? 'tv' : 'movie';
      const title = item.title || item.name || `TMDB #${item.id}`;
      const rawDate = item.release_date || item.first_air_date || '';
      const releaseYear = rawDate ? rawDate.slice(0, 4) : null;
      const candidate: TmdbSearchCandidate = {
        id: item.id,
        title,
        mediaType,
        posterPath: item.poster_path ?? null,
        releaseYear,
        overview: item.overview || '',
      };
      tmdbMetadataCache.set(item.id, {
        title,
        posterPath: item.poster_path ?? null,
        releaseYear,
        mediaType,
      });
      return candidate;
    });
}

interface FallbackSessionPayload {
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    image?: string | null;
    role?: 'admin' | 'user';
    createdAt?: string;
    updatedAt?: string;
  };
}

interface FallbackProfilePayload {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
  memberSince?: string | null;
  region?: string | null;
  language?: string | null;
  maturityRating?: string | null;
  isKids?: boolean;
}

async function buildFallbackAdminUserRecord(): Promise<AdminUserRecord | null> {
  const [session, profile] = await Promise.all([
    fetchClientApi<FallbackSessionPayload>('/api/auth/get-session').catch(() => null),
    fetchClientApi<FallbackProfilePayload>('/api/profile/me').catch(() => null),
  ]);

  if (!session?.user) return null;

  const nowIso = new Date().toISOString();
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: Boolean(session.user.emailVerified),
    image: session.user.image ?? null,
    role: session.user.role === 'admin' ? 'admin' : 'user',
    isActive: true,
    createdAt: session.user.createdAt ?? nowIso,
    updatedAt: session.user.updatedAt ?? nowIso,
    displayName: profile?.displayName ?? session.user.name,
    avatarUrl: profile?.avatarUrl ?? session.user.image ?? null,
    plan: profile?.plan ?? 'free',
    region: profile?.region ?? 'US',
    language: profile?.language ?? 'en-US',
    maturityRating: profile?.maturityRating ?? 'TV-MA',
    isKids: Boolean(profile?.isKids),
    memberSince: profile?.memberSince ?? session.user.createdAt ?? nowIso,
  };
}

export async function getAdminUsers(
  query: AdminUserQuery = {},
): Promise<PaginatedResponse<AdminUserRecord>> {
  const params = new URLSearchParams();
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 8));
  if (query.role && query.role !== 'all') {
    params.set('role', query.role);
  }
  if (query.status) {
    params.set('status', query.status);
  } else {
    params.set('status', 'all');
  }
  if (query.search && query.search.trim().length > 0) {
    params.set('search', query.search.trim());
  }

  try {
    return await fetchClientApi<PaginatedResponse<AdminUserRecord>>(
      `/api/admin/users?${params.toString()}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (!/Cannot GET \/api\/admin\/users|HTTP 404/i.test(message)) {
      throw err;
    }

    const selfRecord = await buildFallbackAdminUserRecord();
    const list = selfRecord ? [selfRecord] : [];
    const filtered = list.filter((item) => {
      if (query.role && query.role !== 'all' && item.role !== query.role) return false;
      if (query.status === 'active' && !item.isActive) return false;
      if (query.status === 'inactive' && item.isActive) return false;
      if (query.search && query.search.trim().length > 0) {
        const term = query.search.trim().toLowerCase();
        const hay = `${item.name} ${item.email} ${item.displayName ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    return {
      data: filtered,
      pagination: {
        total: filtered.length,
        currentPage: 1,
        limit: query.limit ?? 8,
        totalPages: 1,
      },
    };
  }
}

export async function updateAdminUser(
  userId: string,
  input: UpdateAdminUserInput,
): Promise<AdminUserRecord> {
  try {
    return await fetchClientApi<AdminUserRecord>(
      `/api/admin/users/${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (!/Cannot PATCH \/api\/admin\/users|HTTP 404/i.test(message)) {
      throw err;
    }

    if (input.region) {
      await fetchClientApi('/api/profile/region', {
        method: 'PATCH',
        body: JSON.stringify({ region: input.region }),
      });
    }
    if (
      input.language !== undefined ||
      input.maturityRating !== undefined ||
      input.isKids !== undefined
    ) {
      await fetchClientApi('/api/profile/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          language: input.language,
          maturityRating: input.maturityRating,
          isKids: input.isKids,
        }),
      });
    }

    const updatedSelf = await buildFallbackAdminUserRecord();
    if (!updatedSelf) {
      throw err;
    }
    return {
      ...updatedSelf,
      name: input.name ?? updatedSelf.name,
      displayName: input.displayName ?? updatedSelf.displayName,
      plan: input.plan ?? updatedSelf.plan,
    };
  }
}

export async function deleteAdminUser(userId: string): Promise<{ success: boolean }> {
  return fetchClientApi<{ success: boolean }>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}
