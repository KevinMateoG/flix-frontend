import { EmptyState } from '@/src/features/common/components/EmptyState';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import type { DetailedLibraryItem } from '../domain/library';
import { MyListCard } from './MyListCard';

interface MyListViewProps {
  items: DetailedLibraryItem[];
}

export function MyListView({ items }: MyListViewProps) {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-12 md:py-10">
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">My List</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Your List is Empty"
          description="Explore movies and TV shows and click 'My List' to save them here for later."
          actionLabel="Browse Popular"
          actionHref="/browse"
        />
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {items.map((item) => {
            const href = `/${item.mediaType}/${item.tmdbId}`;
            const year = item.release_date
              ? new Date(item.release_date).getFullYear().toString()
              : '';
            const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : '';
            const metadata = [year, rating].filter(Boolean).join(' | ');

            const imageUrl = tmdb.image(item.poster_path, 'w342');

            return (
              <MyListCard
                key={item.id}
                id={item.id}
                href={href}
                title={item.title || 'Untitled'}
                metadata={metadata}
                overview={item.overview}
                imageUrl={imageUrl || undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
