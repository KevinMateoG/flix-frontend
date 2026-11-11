'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/src/features/common/http';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import { tmdbCatalog } from '@/src/features/tmdb/services/tmdb-catalog.service';
import type {
  DetailedLibraryItem,
  LibraryItem,
  ToggleLibraryPayload,
  ToggleLibraryResult,
} from '../domain/library';

export async function toggleMyList({
  tmdbId,
  mediaType,
}: ToggleLibraryPayload): Promise<ToggleLibraryResult> {
  try {
    const data = await fetchApi<ToggleLibraryResult>('/api/my-list/toggle', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType }),
    });
    return { added: !!data?.added };
  } catch (error) {
    console.error('Error toggling my list:', error);
    throw error;
  }
}

export async function getMyList(_profileId: string): Promise<LibraryItem[]> {
  try {
    const data = await fetchApi<LibraryItem[]>('/api/my-list');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching my list:', error);
    return [];
  }
}

export async function getDetailedMyList(
  profileId: string,
  language: string,
): Promise<DetailedLibraryItem[]> {
  let listItems: LibraryItem[] = [];
  try {
    listItems = await getMyList(profileId);
  } catch (err) {
    console.error('Error fetching my list:', err);
  }

  const detailedItems = await Promise.all(
    listItems.map(async (item): Promise<DetailedLibraryItem | null> => {
      try {
        const details =
          item.mediaType === 'tv'
            ? await tmdb.tvDetails(item.tmdbId, language)
            : await tmdbCatalog.movieDetails(item.tmdbId, language);
        // null => movie deactivated by an admin (or not found): hide it from My List.
        if (!details) return null;
        return {
          ...item,
          title: details.title || details.name,
          poster_path: details.poster_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date,
          overview: details.overview,
        };
      } catch (err) {
        console.error(`Error loading TMDB details for watchlist item ${item.tmdbId}:`, err);
        return null;
      }
    }),
  );

  return detailedItems.filter((item): item is DetailedLibraryItem => item !== null);
}

export async function removeFromMyList(listItemId: number): Promise<void> {
  try {
    await fetchApi(`/api/my-list/${listItemId}`, {
      method: 'DELETE',
    });
    revalidatePath('/my-list');
  } catch (error) {
    console.error('Error removing from my list:', error);
    throw error;
  }
}

export async function checkIfInMyList({
  tmdbId,
  mediaType,
}: ToggleLibraryPayload): Promise<boolean> {
  try {
    const data = await fetchApi<{ inList?: boolean }>(
      `/api/my-list/check?tmdbId=${tmdbId}&mediaType=${mediaType}`,
    );
    return !!data?.inList;
  } catch (error) {
    console.error('Error checking my list:', error);
    return false;
  }
}

export async function toggleDislike({
  tmdbId,
  mediaType,
}: ToggleLibraryPayload): Promise<ToggleLibraryResult> {
  try {
    const data = await fetchApi<ToggleLibraryResult>('/api/dislikes/toggle', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType }),
    });
    return { added: !!data?.added };
  } catch (error) {
    console.error('Error toggling dislike:', error);
    throw error;
  }
}

export async function checkIfDisliked({
  tmdbId,
  mediaType,
}: ToggleLibraryPayload): Promise<boolean> {
  try {
    const data = await fetchApi<{ disliked?: boolean }>(
      `/api/dislikes/check?tmdbId=${tmdbId}&mediaType=${mediaType}`,
    );
    return !!data?.disliked;
  } catch (error) {
    console.error('Error checking dislike:', error);
    return false;
  }
}
