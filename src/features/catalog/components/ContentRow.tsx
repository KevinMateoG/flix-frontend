import * as React from 'react';
import Link from 'next/link';
import { MovieCard } from '@/src/features/common/components/MovieCard';
import { cn } from '@/src/features/common/config';
import type { TmdbMediaItem } from '@/src/features/tmdb/domain/tmdb';

interface ContentRowProps {
  title: string;
  items: TmdbMediaItem[];
  getImage: (item: TmdbMediaItem) => string | null;
  className?: string;
  demoMode?: boolean;
}

export function ContentRow({
  title,
  items,
  getImage,
  className,
  demoMode = false,
}: ContentRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className={cn('flex flex-col gap-4 px-4 md:px-12', className)}>
      <h2 className="text-headline-sm text-on-background border-primary border-l-4 pl-3">
        {title}
      </h2>
      <div className="scrollbar-thumb-surface-bright flex scrollbar-thin scrollbar-track-transparent gap-4 overflow-x-auto pb-4">
        {items.map((item) => {
          const itemTitle = item.title || item.name || 'Untitled';
          const mediaType =
            item.media_type === 'tv' || (!item.media_type && item.first_air_date)
              ? 'tv'
              : 'movie';
          const id = item.id;

          const basePath = `/${mediaType}/${id}`;
          const href = demoMode ? `${basePath}?demoMode=all` : basePath;

          const rawDate = item.release_date || item.first_air_date;
          const year = rawDate ? new Date(rawDate).getFullYear().toString() : '';
          const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : '';
          const metadata = [year, rating].filter(Boolean).join(' | ');

          return (
            <Link
              key={`${mediaType}-${id}`}
              href={href}
              className="w-[140px] shrink-0 md:w-[200px]"
            >
              <MovieCard
                title={itemTitle}
                metadata={metadata}
                imageUrl={getImage(item) || undefined}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
