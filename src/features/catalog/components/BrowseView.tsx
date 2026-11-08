import Link from 'next/link';
import { Button } from '@/src/features/common/components/Button';
import { MovieCard } from '@/src/features/common/components/MovieCard';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import { BROWSE_GENRES, type BrowsePageData } from '../domain/catalog';

export function BrowseView({ genre, isDemo, region, results }: BrowsePageData) {
  const getHref = (base: string) =>
    isDemo ? `${base}${base.includes('?') ? '&' : '?'}demoMode=all` : base;

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-12 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">Browse</h1>
      </div>

      <div className="scrollbar-thumb-surface-bright flex scrollbar-thin scrollbar-track-transparent gap-2 overflow-x-auto pb-2">
        {BROWSE_GENRES.map((g) => {
          const isActive = genre === g.id;
          const basePath = `/browse${g.id === 'all' ? '' : `?genre=${g.id}`}`;
          const href = getHref(basePath);

          return (
            <Link key={g.id} href={href} className="shrink-0">
              <Button
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                className="pointer-events-none"
              >
                {g.name}
              </Button>
            </Link>
          );
        })}
      </div>

      {!isDemo && results.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <h2 className="text-display-sm text-on-background">
            No hay contenido disponible en tu región todavía
          </h2>
          <p className="text-body-lg text-muted">
            Tu región actual es: <strong>{region}</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((item) => {
          const itemTitle = item.title || item.name || 'Untitled';
          const mediaType =
            item.media_type === 'tv' || (!item.media_type && item.first_air_date)
              ? 'tv'
              : 'movie';
          const id = item.id;

          const rawDate = item.release_date || item.first_air_date;
          const year = rawDate ? new Date(rawDate).getFullYear().toString() : '';
          const rating = item.vote_average ? `${item.vote_average.toFixed(1)} ★` : '';
          const metadata = [year, rating].filter(Boolean).join(' | ');
          const imageUrl = tmdb.image(item.poster_path, 'w342');
          const itemHref = getHref(`/${mediaType}/${id}`);

          return (
            <Link key={`${mediaType}-${id}`} href={itemHref}>
              <MovieCard title={itemTitle} metadata={metadata} imageUrl={imageUrl || undefined} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
