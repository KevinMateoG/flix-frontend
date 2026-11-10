import type { UserRole } from '@/src/features/auth/domain/auth';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

export type EntityStatusFilter = 'all' | 'active' | 'inactive';

export interface PaginationMeta {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface AdminMovieRecord {
  tmdbId: number;
  muxPlaybackId: string;
  muxAssetId: string | null;
  availableRegions: string[];
  isActive: boolean;
  title?: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  mediaType?: TmdbMediaType;
}

export interface AdminMovieQuery {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  status?: EntityStatusFilter;
}

export interface CreateAdminMovieInput {
  tmdbId: number;
  muxPlaybackId: string;
  muxAssetId?: string | null;
  availableRegions: string[];
}

export interface UpdateAdminMovieInput {
  muxPlaybackId?: string;
  muxAssetId?: string | null;
  availableRegions?: string[];
  isActive?: boolean;
}

export interface TmdbSearchCandidate {
  id: number;
  title: string;
  mediaType: TmdbMediaType;
  posterPath: string | null;
  releaseYear: string | null;
  overview: string;
}

export const DEFAULT_MUX_HLS_PLAYBACK_ID =
  'qxb01i6T202018GGSNzgwtm00hzV02M4FbdQ344Xw2bU6I';

export interface TmdbPlaybackHelperResult {
  tmdbId: number;
  title: string;
  releaseYear: string | null;
  mediaType: TmdbMediaType;
  muxPlaybackId: string;
  muxAssetId: string | null;
  trailerPlaybackId: string | null;
  defaultMuxPlaybackId: string;
  availableRegions: string[];
  source: 'catalog' | 'tmdb_trailer' | 'mux_default';
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: string | null;
  region: string | null;
  language: string | null;
  maturityRating: string | null;
  isKids: boolean;
  memberSince: string | null;
}

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | UserRole;
  status?: EntityStatusFilter;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  displayName?: string;
  plan?: string | null;
  region?: string;
  language?: string;
  maturityRating?: string;
  isKids?: boolean;
}

export const SUPPORTED_CATALOG_REGIONS = [
  'US',
  'CO',
  'MX',
  'AR',
  'BR',
  'CL',
  'PE',
  'ES',
  'CA',
  'GB',
  'FR',
  'DE',
  'IT',
  'JP',
  'KR',
  'AU',
] as const;

export const SUBSCRIPTION_PLANS = [
  { code: 'free', label: 'Free' },
  { code: 'standard', label: 'Standard HD' },
  { code: 'premium', label: 'Premium 4K' },
] as const;
