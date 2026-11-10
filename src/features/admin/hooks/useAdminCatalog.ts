'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  AdminMovieRecord,
  CreateAdminMovieInput,
  EntityStatusFilter,
  PaginationMeta,
  TmdbSearchCandidate,
  UpdateAdminMovieInput,
} from '../domain/admin';
import {
  createAdminMovie,
  deleteAdminMovie,
  getAdminMovies,
  searchTmdbForAdmin,
  updateAdminMovie,
} from '../services/admin.service';

export interface AdminFeedback {
  type: 'success' | 'error';
  message: string;
}

export function useAdminCatalog(initialLimit = 8) {
  const [items, setItems] = useState<AdminMovieRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    currentPage: 1,
    limit: initialLimit,
    totalPages: 1,
  });
  const [page, setPageState] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [region, setRegion] = useState('ALL');
  const [status, setStatus] = useState<EntityStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);

  const [tmdbQuery, setTmdbQueryState] = useState('');
  const [tmdbCandidates, setTmdbCandidates] = useState<TmdbSearchCandidate[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  const setTmdbQuery = useCallback((nextQuery: string) => {
    setTmdbQueryState(nextQuery);
    if (!nextQuery || nextQuery.trim().length < 2) {
      setTmdbCandidates([]);
      setIsSearchingTmdb(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== search) {
          setIsLoading(true);
          setPageState(1);
        }
        return search;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (tmdbQuery.trim().length < 2) {
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setIsSearchingTmdb(true);
      try {
        const found = await searchTmdbForAdmin(tmdbQuery);
        if (active) {
          setTmdbCandidates(found);
        }
      } catch {
        if (active) {
          setTmdbCandidates([]);
        }
      } finally {
        if (active) {
          setIsSearchingTmdb(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [tmdbQuery]);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminMovies({
        page,
        limit: initialLimit,
        search: debouncedSearch,
        region,
        status,
      });
      setItems(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load catalog entries.');
    } finally {
      setIsLoading(false);
    }
  }, [page, initialLimit, debouncedSearch, region, status]);

  useEffect(() => {
    let active = true;
    async function fetchInitialOrFilteredCatalog() {
      try {
        const response = await getAdminMovies({
          page,
          limit: initialLimit,
          search: debouncedSearch,
          region,
          status,
        });
        if (active) {
          setItems(response.data);
          setPagination(response.pagination);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load catalog entries.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void fetchInitialOrFilteredCatalog();
    return () => {
      active = false;
    };
  }, [page, initialLimit, debouncedSearch, region, status]);

  const setPage = useCallback((nextPage: number | ((prev: number) => number)) => {
    setIsLoading(true);
    setPageState(nextPage);
  }, []);

  const handleRegionChange = useCallback((nextRegion: string) => {
    setIsLoading(true);
    setRegion(nextRegion);
    setPageState(1);
  }, []);

  const handleStatusChange = useCallback((nextStatus: EntityStatusFilter) => {
    setIsLoading(true);
    setStatus(nextStatus);
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setIsLoading(true);
    setSearch('');
    setDebouncedSearch('');
    setRegion('ALL');
    setStatus('all');
    setPageState(1);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleCreateMovie = useCallback(
    async (input: CreateAdminMovieInput): Promise<boolean> => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        await createAdminMovie(input);
        setFeedback({
          type: 'success',
          message: `Title TMDB #${input.tmdbId} saved to playable catalog.`,
        });
        await loadCatalog();
        return true;
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not create playable title.',
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadCatalog],
  );

  const handleUpdateMovie = useCallback(
    async (tmdbId: number, input: UpdateAdminMovieInput): Promise<boolean> => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        await updateAdminMovie(tmdbId, input);
        setFeedback({
          type: 'success',
          message: `Title TMDB #${tmdbId} updated.`,
        });
        await loadCatalog();
        return true;
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not update playable title.',
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadCatalog],
  );

  const handleDeleteMovie = useCallback(
    async (tmdbId: number): Promise<boolean> => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        await deleteAdminMovie(tmdbId);
        setFeedback({
          type: 'success',
          message: `Title TMDB #${tmdbId} deactivated (logical deletion).`,
        });
        await loadCatalog();
        return true;
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not deactivate playable title.',
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadCatalog],
  );

  const handleRestoreMovie = useCallback(
    async (tmdbId: number): Promise<boolean> => {
      return handleUpdateMovie(tmdbId, { isActive: true });
    },
    [handleUpdateMovie],
  );

  return {
    items,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    region,
    setRegion: handleRegionChange,
    status,
    setStatus: handleStatusChange,
    isLoading,
    error,
    isSubmitting,
    feedback,
    clearFeedback,
    reload: loadCatalog,
    resetFilters,
    createMovie: handleCreateMovie,
    updateMovie: handleUpdateMovie,
    deleteMovie: handleDeleteMovie,
    restoreMovie: handleRestoreMovie,
    tmdbQuery,
    setTmdbQuery,
    tmdbCandidates,
    setTmdbCandidates,
    isSearchingTmdb,
  };
}
