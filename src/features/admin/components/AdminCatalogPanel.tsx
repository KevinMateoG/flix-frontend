'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import { appConfig, cn } from '@/src/features/common/config';
import {
  DEFAULT_MUX_HLS_PLAYBACK_ID,
  SUPPORTED_CATALOG_REGIONS,
  type AdminMovieRecord,
  type EntityStatusFilter,
  type TmdbPlaybackHelperResult,
  type TmdbSearchCandidate,
} from '../domain/admin';
import { useAdminCatalog } from '../hooks/useAdminCatalog';
import { resolveTmdbPlaybackHelper } from '../services/admin.service';

const CORE_REGIONS = ['US', 'CO', 'MX', 'ES'];

export function AdminCatalogPanel() {
  const {
    items,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    region,
    setRegion,
    status,
    setStatus,
    isLoading,
    error,
    isSubmitting,
    feedback,
    clearFeedback,
    reload,
    resetFilters,
    createMovie,
    updateMovie,
    deleteMovie,
    restoreMovie,
    tmdbQuery,
    setTmdbQuery,
    tmdbCandidates,
    setTmdbCandidates,
    isSearchingTmdb,
  } = useAdminCatalog(8);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMovieRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdminMovieRecord | null>(null);

  const [formTmdbId, setFormTmdbId] = useState('');
  const [formSelectedTitle, setFormSelectedTitle] = useState<string | null>(null);
  const [formMuxPlaybackId, setFormMuxPlaybackId] = useState('');
  const [formMuxAssetId, setFormMuxAssetId] = useState('');
  const [formRegions, setFormRegions] = useState<string[]>(CORE_REGIONS);
  const [formCustomRegion, setFormCustomRegion] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [helperData, setHelperData] = useState<TmdbPlaybackHelperResult | null>(null);
  const [isResolvingHelper, setIsResolvingHelper] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (deletingItem && !isSubmitting) {
          setDeletingItem(null);
        } else if (isFormOpen && !isSubmitting) {
          setIsFormOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deletingItem, isFormOpen, isSubmitting]);

  const applyHelperLookup = async (
    tmdbId: number,
    mediaType?: 'movie' | 'tv',
    preserveExistingPlayback = false,
  ) => {
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      setFormError('Enter a valid positive numeric TMDB ID first.');
      return;
    }

    setIsResolvingHelper(true);
    setFormError(null);
    try {
      const resolved = await resolveTmdbPlaybackHelper(tmdbId, mediaType);
      setHelperData(resolved);
      setFormSelectedTitle(
        `${resolved.title}${resolved.releaseYear ? ` (${resolved.releaseYear})` : ''}`,
      );
      if (!preserveExistingPlayback) {
        setFormMuxPlaybackId(resolved.muxPlaybackId);
        if (resolved.muxAssetId) {
          setFormMuxAssetId(resolved.muxAssetId);
        }
        if (resolved.availableRegions.length > 0) {
          setFormRegions(resolved.availableRegions);
        }
      }
    } catch {
      setFormError('Could not resolve TMDB playback details for this ID.');
    } finally {
      setIsResolvingHelper(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTmdbId('');
    setFormSelectedTitle(null);
    setFormMuxPlaybackId('');
    setFormMuxAssetId('');
    setFormRegions(CORE_REGIONS);
    setFormCustomRegion('');
    setFormIsActive(true);
    setFormError(null);
    setHelperData(null);
    setTmdbQuery('');
    setTmdbCandidates([]);
    clearFeedback();
    setIsFormOpen(true);
  };

  const openEditModal = (item: AdminMovieRecord) => {
    setEditingItem(item);
    setFormTmdbId(String(item.tmdbId));
    setFormSelectedTitle(item.title ?? `TMDB #${item.tmdbId}`);
    setFormMuxPlaybackId(item.muxPlaybackId);
    setFormMuxAssetId(
      item.muxAssetId && item.muxAssetId.toLowerCase() !== 'null' ? item.muxAssetId : '',
    );
    setFormRegions(item.availableRegions.length > 0 ? item.availableRegions : ['US']);
    setFormCustomRegion('');
    setFormIsActive(item.isActive);
    setFormError(null);
    setHelperData(null);
    setTmdbQuery('');
    setTmdbCandidates([]);
    clearFeedback();
    setIsFormOpen(true);
    void applyHelperLookup(item.tmdbId, item.mediaType, true);
  };

  const selectTmdbCandidate = (candidate: TmdbSearchCandidate) => {
    setFormTmdbId(String(candidate.id));
    setFormSelectedTitle(
      `${candidate.title}${candidate.releaseYear ? ` (${candidate.releaseYear})` : ''}`,
    );
    setFormMuxPlaybackId((prev) => prev.trim() || DEFAULT_MUX_HLS_PLAYBACK_ID);
    setTmdbQuery('');
    setTmdbCandidates([]);
    void applyHelperLookup(candidate.id, candidate.mediaType, false);
  };

  const toggleRegionSelection = (code: string) => {
    setFormRegions((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
  };

  const handleAddCustomRegion = () => {
    const normalized = formCustomRegion.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) {
      setFormError('Region code must be a 2-letter ISO code such as US, CO, or MX.');
      return;
    }
    setFormError(null);
    if (!formRegions.includes(normalized)) {
      setFormRegions((prev) => [...prev, normalized]);
    }
    setFormCustomRegion('');
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsedTmdbId = Number(formTmdbId.trim());
    if (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0) {
      setFormError('Enter a valid positive numeric TMDB ID.');
      return;
    }

    const playbackId = formMuxPlaybackId.trim();
    if (!playbackId) {
      setFormError('Mux Playback ID is required to stream this title.');
      return;
    }

    if (formRegions.length === 0) {
      setFormError('Select at least one available region.');
      return;
    }

    const rawAsset = formMuxAssetId.trim();
    const assetId = rawAsset && rawAsset.toLowerCase() !== 'null' ? rawAsset : null;

    if (editingItem) {
      const ok = await updateMovie(editingItem.tmdbId, {
        muxPlaybackId: playbackId,
        muxAssetId: assetId,
        availableRegions: formRegions,
        isActive: formIsActive,
      });
      if (ok) {
        setIsFormOpen(false);
      }
    } else {
      const ok = await createMovie({
        tmdbId: parsedTmdbId,
        muxPlaybackId: playbackId,
        muxAssetId: assetId,
        availableRegions: formRegions,
      });
      if (ok) {
        setIsFormOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const ok = await deleteMovie(deletingItem.tmdbId);
    if (ok) {
      setDeletingItem(null);
    }
  };

  const hasActiveFilters = search.trim().length > 0 || region !== 'ALL' || status !== 'all';

  return (
    <section aria-labelledby="catalog-management-heading" className="flex flex-col gap-6">
      <div className="bg-surface-container border-surface-bright/30 flex flex-col gap-4 rounded-lg border p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2
              id="catalog-management-heading"
              className="text-headline-sm text-on-background font-semibold"
            >
              Playable Movies and Series Library
            </h2>
            <p className="text-body-sm text-muted mt-1">
              Manage Mux HLS streams, regional availability, and logical status for catalog titles.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateModal}
            className="min-h-11 gap-2 self-start sm:self-auto"
          >
            <Plus size={18} />
            Add Playable Title
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search
              size={18}
              className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by TMDB ID, Mux Playback ID, or Asset ID..."
              aria-label="Search catalog by TMDB ID or Mux Playback ID"
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border pr-4 pl-10 focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-catalog-region-filter" className="sr-only">
              Filter by region
            </label>
            <select
              id="admin-catalog-region-filter"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="ALL">All Regions</option>
              {SUPPORTED_CATALOG_REGIONS.map((code) => (
                <option key={code} value={code}>
                  Region: {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="admin-catalog-status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="admin-catalog-status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value as EntityStatusFilter)}
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="all">Status: All Titles</option>
              <option value="active">Status: Active Only</option>
              <option value="inactive">Status: Inactive (Deleted)</option>
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={cn(
            'flex items-center justify-between gap-4 rounded-lg border px-4 py-3',
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
              : 'border-error/40 bg-error-container/30 text-error',
          )}
        >
          <span className="text-body-sm font-medium">{feedback.message}</span>
          <button
            type="button"
            onClick={clearFeedback}
            aria-label="Dismiss notification"
            className="hover:bg-surface-bright/40 focus-visible:ring-primary flex h-9 w-9 items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-surface-container border-surface-bright/30 flex flex-col gap-4 rounded-lg border p-6"
        >
          <p className="text-body-sm text-muted">Loading playable catalog entries...</p>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="bg-surface-container-high h-16 w-full animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="bg-surface-container border-error/40 flex flex-col items-start justify-between gap-4 rounded-lg border p-6 sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="text-headline-sm text-error font-semibold">
              Failed to load playable catalog
            </h3>
            <p className="text-body-sm text-on-background mt-1">{error}</p>
          </div>
          <Button type="button" onClick={() => void reload()} className="min-h-11">
            Retry Loading Catalog
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container border-surface-bright/30 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
          <div className="bg-surface-container-high text-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Film size={24} />
          </div>
          <h3 className="text-headline-sm text-on-background font-semibold">
            {hasActiveFilters
              ? 'No catalog titles match your current filters'
              : 'No playable titles registered yet'}
          </h3>
          <p className="text-body-sm text-muted mt-2 mb-6 max-w-md">
            {hasActiveFilters
              ? 'Clear the search query or change the region and status filters to view all playable entries.'
              : 'Add a movie or series by linking its TMDB identifier with a Mux Playback ID.'}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="secondary"
              onClick={resetFilters}
              className="min-h-11"
            >
              Reset Catalog Filters
            </Button>
          ) : (
            <Button type="button" onClick={openCreateModal} className="min-h-11 gap-2">
              <Plus size={18} />
              Add First Playable Title
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-surface-container border-surface-bright/30 hidden overflow-x-auto rounded-lg border lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-surface-bright/30 bg-surface-container-high/60 border-b">
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    Title & TMDB ID
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    Mux Playback ID
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    Regions
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-surface-bright/20 divide-y">
                {items.map((item) => {
                  const cleanAssetId =
                    item.muxAssetId && item.muxAssetId.toLowerCase() !== 'null'
                      ? item.muxAssetId
                      : null;

                  return (
                    <tr
                      key={item.tmdbId}
                      className={cn(
                        'hover:bg-surface-container-high/40 transition-colors',
                        !item.isActive && 'opacity-70',
                      )}
                    >
                      <td className="max-w-[260px] min-w-[200px] px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="bg-surface-container-high border-surface-bright/30 flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded border">
                            {item.posterPath ? (
                              <img
                                src={`${appConfig.tmdbImageBaseUrl}/w92${item.posterPath}`}
                                alt={item.title || `TMDB ${item.tmdbId}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Film size={16} className="text-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-body-sm text-on-background truncate font-semibold">
                                {item.title || `TMDB #${item.tmdbId}`}
                              </span>
                              <Link
                                href={`/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${item.tmdbId}`}
                                className="text-muted hover:text-on-background focus-visible:ring-primary inline-flex shrink-0 items-center rounded p-1 transition-colors focus-visible:ring-1 focus-visible:outline-none"
                                title="Open title detail page"
                              >
                                <ExternalLink size={14} />
                                <span className="sr-only">Open detail page</span>
                              </Link>
                            </div>
                            <p className="text-muted truncate text-xs tabular-nums">
                              ID: <code className="text-on-background">{item.tmdbId}</code>
                              {item.releaseYear ? ` · ${item.releaseYear}` : ''}
                              {item.mediaType ? ` · ${item.mediaType.toUpperCase()}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[230px] min-w-[180px] px-4 py-3.5">
                        <code
                          title={item.muxPlaybackId}
                          className="bg-surface-container-high text-on-background block max-w-[200px] truncate rounded px-2 py-1 text-xs tabular-nums"
                        >
                          {item.muxPlaybackId}
                        </code>
                        {cleanAssetId && (
                          <span
                            title={cleanAssetId}
                            className="text-muted mt-1 block max-w-[200px] truncate text-xs tabular-nums"
                          >
                            Asset: {cleanAssetId}
                          </span>
                        )}
                      </td>

                      <td className="min-w-[190px] whitespace-nowrap px-4 py-3.5">
                        <div
                          className="inline-flex items-center gap-1 whitespace-nowrap"
                          title={item.availableRegions.join(', ')}
                        >
                          {item.availableRegions.slice(0, 4).map((reg) => (
                            <span
                              key={reg}
                              className="bg-surface-container-high border-surface-bright/40 text-on-background inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium tabular-nums"
                            >
                              {reg}
                            </span>
                          ))}
                          {item.availableRegions.length > 4 && (
                            <span className="bg-surface-container-high/60 border-surface-bright/30 text-muted inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium tabular-nums">
                              +{item.availableRegions.length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                            <Check size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="border-error/40 bg-error-container/30 text-error inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold">
                            <X size={12} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            disabled={isSubmitting}
                            className="min-h-10 gap-1.5 whitespace-nowrap px-3"
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>

                          {item.isActive ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setDeletingItem(item)}
                              disabled={isSubmitting}
                              className="border-error/30 text-error hover:bg-error/10 min-h-10 gap-1.5 whitespace-nowrap px-3"
                            >
                              <Trash2 size={14} />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => void restoreMovie(item.tmdbId)}
                              disabled={isSubmitting}
                              className="min-h-10 gap-1.5 whitespace-nowrap border-emerald-500/30 px-3 text-emerald-300 hover:bg-emerald-950/40"
                            >
                              <RotateCcw size={14} />
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {items.map((item) => (
              <article
                key={item.tmdbId}
                className={cn(
                  'bg-surface-container border-surface-bright/30 flex flex-col justify-between gap-4 rounded-lg border p-4',
                  !item.isActive && 'opacity-75',
                )}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-container-high border-surface-bright/30 flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded border">
                        {item.posterPath ? (
                          <img
                            src={`${appConfig.tmdbImageBaseUrl}/w92${item.posterPath}`}
                            alt={item.title || `TMDB ${item.tmdbId}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Film size={18} className="text-muted" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-body-lg text-on-background font-semibold">
                          {item.title || `TMDB #${item.tmdbId}`}
                        </h3>
                        <p className="text-muted text-xs tabular-nums">
                          TMDB ID: <code className="text-on-background">{item.tmdbId}</code>
                          {item.releaseYear ? ` · ${item.releaseYear}` : ''}
                        </p>
                      </div>
                    </div>

                    {item.isActive ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="border-error/40 bg-error-container/30 text-error inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="bg-surface-container-high rounded p-2.5">
                    <span className="text-label-caps text-muted block">Mux Playback ID</span>
                    <code className="text-on-background mt-1 block break-all text-xs tabular-nums">
                      {item.muxPlaybackId}
                    </code>
                  </div>

                  <div>
                    <span className="text-label-caps text-muted block">
                      Regions ({item.availableRegions.length})
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.availableRegions.slice(0, 8).map((reg) => (
                        <span
                          key={reg}
                          className="bg-surface-container-high border-surface-bright/40 text-on-background rounded border px-2 py-0.5 text-xs tabular-nums"
                        >
                          {reg}
                        </span>
                      ))}
                      {item.availableRegions.length > 8 && (
                        <span className="bg-surface-container-high/60 border-surface-bright/30 text-muted rounded border px-2 py-0.5 text-xs tabular-nums">
                          +{item.availableRegions.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-surface-bright/20 flex items-center gap-2 border-t pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    disabled={isSubmitting}
                    className="min-h-11 flex-1 gap-1.5"
                  >
                    <Pencil size={15} />
                    Edit
                  </Button>
                  {item.isActive ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setDeletingItem(item)}
                      disabled={isSubmitting}
                      className="border-error/30 text-error hover:bg-error/10 min-h-11 flex-1 gap-1.5"
                    >
                      <Trash2 size={15} />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void restoreMovie(item.tmdbId)}
                      disabled={isSubmitting}
                      className="min-h-11 flex-1 gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40"
                    >
                      <RotateCcw size={15} />
                      Restore
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="bg-surface-container border-surface-bright/30 flex flex-col items-center justify-between gap-4 rounded-lg border px-4 py-3 sm:flex-row">
            <p className="text-body-sm text-muted tabular-nums">
              Showing page{' '}
              <span className="text-on-background font-semibold">{pagination.currentPage}</span> of{' '}
              <span className="text-on-background font-semibold">{pagination.totalPages}</span> (
              <span className="text-on-background font-semibold">{pagination.total}</span> total
              records)
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="min-h-11 gap-1 px-3"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="min-h-11 gap-1 px-3"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-surface-container border-surface-bright/40 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-lg border p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 id="catalog-modal-title" className="text-headline-sm text-on-background font-bold">
                {editingItem
                  ? `Edit Playable Title (TMDB #${editingItem.tmdbId})`
                  : 'Add Playable Title to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="text-muted hover:text-on-background focus-visible:ring-primary flex h-11 w-11 items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              {!editingItem && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tmdb-search-helper"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Search TMDB Title (Auto-fills TMDB ID, Mux Playback & Regions)
                  </label>
                  <input
                    id="tmdb-search-helper"
                    type="search"
                    value={tmdbQuery}
                    onChange={(e) => setTmdbQuery(e.target.value)}
                    placeholder="Type a movie or series name (e.g. Spirited Away)..."
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 focus-visible:ring-1 focus-visible:outline-none"
                  />
                  {isSearchingTmdb && (
                    <span className="text-muted text-xs">Searching TMDB catalog...</span>
                  )}
                  {tmdbCandidates.length > 0 && (
                    <div className="border-surface-bright/40 bg-surface-container-high divide-surface-bright/20 max-h-48 divide-y overflow-y-auto rounded border">
                      {tmdbCandidates.map((candidate) => (
                        <button
                          key={`${candidate.mediaType}-${candidate.id}`}
                          type="button"
                          onClick={() => selectTmdbCandidate(candidate)}
                          className="hover:bg-surface-bright/40 focus-visible:ring-primary flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors focus-visible:ring-1 focus-visible:outline-none"
                        >
                          <div className="min-w-0">
                            <p className="text-body-sm text-on-background truncate font-medium">
                              {candidate.title}
                            </p>
                            <p className="text-muted text-xs tabular-nums">
                              TMDB #{candidate.id} · {candidate.mediaType.toUpperCase()}
                              {candidate.releaseYear ? ` · ${candidate.releaseYear}` : ''}
                            </p>
                          </div>
                          <span className="text-primary shrink-0 text-xs font-semibold">
                            Select & Auto-fill
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="catalog-form-tmdb-id"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    TMDB Numeric ID
                  </label>
                  <button
                    type="button"
                    disabled={!formTmdbId.trim() || isResolvingHelper}
                    onClick={() => void applyHelperLookup(Number(formTmdbId.trim()), undefined, false)}
                    className="text-primary hover:text-primary/80 focus-visible:ring-primary inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:ring-1 focus-visible:outline-none"
                  >
                    <Sparkles size={13} />
                    {isResolvingHelper ? 'Resolving...' : 'Resolve Playback & Regions by ID'}
                  </button>
                </div>
                <input
                  id="catalog-form-tmdb-id"
                  type="number"
                  min={1}
                  required
                  disabled={Boolean(editingItem)}
                  value={formTmdbId}
                  onChange={(e) => setFormTmdbId(e.target.value)}
                  placeholder="129"
                  className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 tabular-nums disabled:opacity-60 focus-visible:ring-1 focus-visible:outline-none"
                />
                {formSelectedTitle && (
                  <p className="text-muted text-xs">
                    Selected title: <span className="text-on-background font-medium">{formSelectedTitle}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="catalog-form-playback-id"
                  className="text-body-sm text-on-background font-semibold"
                >
                  Mux Playback ID
                </label>
                <input
                  id="catalog-form-playback-id"
                  type="text"
                  required
                  value={formMuxPlaybackId}
                  onChange={(e) => setFormMuxPlaybackId(e.target.value)}
                  placeholder={DEFAULT_MUX_HLS_PLAYBACK_ID}
                  className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 font-mono text-xs focus-visible:ring-1 focus-visible:outline-none"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-muted text-xs">Helper presets:</span>
                  <button
                    type="button"
                    onClick={() => setFormMuxPlaybackId(DEFAULT_MUX_HLS_PLAYBACK_ID)}
                    className={cn(
                      'focus-visible:ring-primary rounded border px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none',
                      formMuxPlaybackId === DEFAULT_MUX_HLS_PLAYBACK_ID
                        ? 'border-primary bg-primary/20 text-on-background'
                        : 'border-surface-bright bg-surface-container-high text-muted hover:text-on-background',
                    )}
                  >
                    Flix Mux HLS Stream
                  </button>
                  {helperData?.trailerPlaybackId && (
                    <button
                      type="button"
                      onClick={() =>
                        helperData.trailerPlaybackId &&
                        setFormMuxPlaybackId(helperData.trailerPlaybackId)
                      }
                      className={cn(
                        'focus-visible:ring-primary rounded border px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none',
                        formMuxPlaybackId === helperData.trailerPlaybackId
                          ? 'border-primary bg-primary/20 text-on-background'
                          : 'border-surface-bright bg-surface-container-high text-muted hover:text-on-background',
                      )}
                    >
                      TMDB Official Trailer ({helperData.trailerPlaybackId})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFormMuxPlaybackId(appConfig.muxTestPlaybackId)}
                    className={cn(
                      'focus-visible:ring-primary rounded border px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none',
                      formMuxPlaybackId === appConfig.muxTestPlaybackId
                        ? 'border-primary bg-primary/20 text-on-background'
                        : 'border-surface-bright bg-surface-container-high text-muted hover:text-on-background',
                    )}
                  >
                    Mux Demo ({appConfig.muxTestPlaybackId})
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="catalog-form-asset-id"
                  className="text-body-sm text-on-background font-semibold"
                >
                  Mux Asset ID (Optional)
                </label>
                <input
                  id="catalog-form-asset-id"
                  type="text"
                  value={formMuxAssetId}
                  onChange={(e) => setFormMuxAssetId(e.target.value)}
                  placeholder="Optional Mux Asset identifier"
                  className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 focus-visible:ring-1 focus-visible:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-body-sm text-on-background font-semibold">
                    Available Regions ({formRegions.length} selected)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {helperData && helperData.availableRegions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormRegions(helperData.availableRegions)}
                        className="border-surface-bright bg-surface-container-high text-muted hover:text-on-background rounded border px-2 py-1 text-xs font-medium transition-colors"
                      >
                        TMDB Regions ({helperData.availableRegions.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormRegions(CORE_REGIONS)}
                      className="border-surface-bright bg-surface-container-high text-muted hover:text-on-background rounded border px-2 py-1 text-xs font-medium transition-colors"
                    >
                      Core (4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRegions([...SUPPORTED_CATALOG_REGIONS])}
                      className="border-surface-bright bg-surface-container-high text-muted hover:text-on-background rounded border px-2 py-1 text-xs font-medium transition-colors"
                    >
                      All Supported ({SUPPORTED_CATALOG_REGIONS.length})
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_CATALOG_REGIONS.map((code) => {
                    const active = formRegions.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleRegionSelection(code)}
                        className={cn(
                          'focus-visible:ring-primary min-h-10 min-w-11 rounded border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none',
                          active
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-surface-bright bg-surface-container-high text-muted hover:text-on-background',
                        )}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor="custom-region-input" className="sr-only">
                    Add custom 2-letter ISO region code
                  </label>
                  <input
                    id="custom-region-input"
                    type="text"
                    maxLength={2}
                    value={formCustomRegion}
                    onChange={(e) => setFormCustomRegion(e.target.value.toUpperCase())}
                    placeholder="Add ISO code (e.g. NL)"
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary h-11 w-48 rounded border px-3 uppercase focus-visible:outline-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomRegion}
                    className="min-h-11 px-4"
                  >
                    Add Region
                  </Button>
                </div>
              </div>

              {editingItem && (
                <div className="bg-surface-container-high border-surface-bright/30 flex items-center justify-between rounded border p-3.5">
                  <div>
                    <span className="text-body-sm text-on-background block font-semibold">
                      Catalog Visibility Status
                    </span>
                    <span className="text-muted text-xs">
                      When unchecked, this title is logically deactivated and hidden from users.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Catalog visibility status"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="accent-primary h-5 w-5 cursor-pointer"
                  />
                </div>
              )}

              {formError && (
                <p role="alert" className="text-error text-body-sm font-medium">
                  {formError}
                </p>
              )}

              <div className="mt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="min-h-11"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-h-11">
                  {isSubmitting
                    ? 'Saving...'
                    : editingItem
                      ? 'Save Changes'
                      : 'Create Playable Title'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-movie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-surface-container border-surface-bright/40 w-full max-w-md rounded-lg border p-6 shadow-2xl">
            <h3
              id="delete-movie-modal-title"
              className="text-headline-sm text-on-background font-bold"
            >
              Deactivate Playable Title
            </h3>
            <p className="text-body-sm text-muted mt-3">
              Are you sure you want to logically deactivate{' '}
              <span className="text-on-background font-semibold">
                {deletingItem.title || `TMDB #${deletingItem.tmdbId}`}
              </span>
              ? The record will remain in the database with{' '}
              <code className="text-primary">isActive = false</code> and can be restored by an
              administrator at any time.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingItem(null)}
                disabled={isSubmitting}
                className="min-h-11"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isSubmitting}
                className="min-h-11"
              >
                {isSubmitting ? 'Deactivating...' : 'Confirm Logical Deactivation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
