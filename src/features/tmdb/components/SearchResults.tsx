import * as React from 'react';
import Link from 'next/link';
import { MovieCard } from '@/src/features/common/components/MovieCard';
import { EmptyState } from '@/src/features/common/components/EmptyState';
import { tmdb } from '../services/tmdb.service';
import type { TmdbMediaItem } from '../domain/tmdb';

interface SearchResultsProps {
  items: TmdbMediaItem[];
  query: string;
}

export function SearchResults({ items, query }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="text-muted text-body-sm py-12 text-center">
        Start typing to search movies, TV shows, and cast.
      </div>
    );
  }

  const mediaResults = items.filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv',
  );

  if (mediaResults.length === 0) {
    return (
      <EmptyState
        title="No Results Found"
        description={`We couldn't find any matches for "${query}". Try checking the spelling or using different keywords.`}
      />
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {mediaResults.map((item) => {
        const itemTitle = item.title || item.name || 'Untitled';
        const mediaType = item.media_type;
        const id = item.id;
        const href = `/${mediaType}/${id}`;

        const rawDate = item.release_date || item.first_air_date;
        const year = rawDate ? new Date(rawDate).getFullYear().toString() : '';
        const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : '';
        const metadata = [year, rating].filter(Boolean).join(' | ');

        const imageUrl = tmdb.image(item.poster_path, 'w342');

        return (
          <Link key={`${mediaType}-${id}`} href={href} className="w-full">
            <MovieCard title={itemTitle} metadata={metadata} imageUrl={imageUrl || undefined} />
          </Link>
        );
      })}
    </div>
  );
}
