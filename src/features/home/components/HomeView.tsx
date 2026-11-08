import { ContentRow } from '@/src/features/catalog/components/ContentRow';
import { HeroSection } from '@/src/features/catalog/components/HeroSection';
import { ContinueWatchingRow } from '@/src/features/history/components/ContinueWatchingRow';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import type { HomePageData } from '../domain/home';

export function HomeView({
  isDemo,
  region,
  profileId,
  messages: t,
  continueWatching,
  hero,
  regionalItems,
  trending,
  popularMovies,
  popularTV,
  topRated,
}: HomePageData) {
  if (!isDemo) {
    if (regionalItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 px-4 pt-32 pb-12 text-center md:px-12">
          <h2 className="text-display-sm text-on-background">
            No hay contenido disponible en tu región todavía
          </h2>
          <p className="text-body-lg text-muted mt-2">
            Tu región actual es: <strong>{region}</strong>
          </p>
        </div>
      );
    }

    const heroMediaType = hero?.media_type === 'tv' ? 'tv' : 'movie';

    return (
      <div className="flex flex-col gap-12 pb-12">
        {hero && (
          <HeroSection
            title={hero.title || hero.name || 'Untitled'}
            overview={hero.overview || ''}
            backdropUrl={tmdb.backdrop(hero.backdrop_path, 'w1280')}
            tmdbId={hero.id}
            mediaType={heroMediaType}
            profileId={profileId}
            detailsUrl={`/${heroMediaType}/${hero.id}`}
          />
        )}

        {continueWatching && continueWatching.length > 0 && (
          <ContinueWatchingRow items={continueWatching} title={t.continueWatching} />
        )}

        <ContentRow
          title="Available in your Region"
          items={regionalItems}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
          demoMode={false}
        />
      </div>
    );
  }

  const heroMediaType = hero?.media_type === 'tv' ? 'tv' : 'movie';

  return (
    <div className="flex flex-col gap-12 pb-12">
      {hero && (
        <HeroSection
          title={hero.title || hero.name || 'Untitled'}
          overview={hero.overview || ''}
          backdropUrl={tmdb.backdrop(hero.backdrop_path, 'w1280')}
          tmdbId={hero.id}
          mediaType={heroMediaType}
          profileId={profileId}
          detailsUrl={`/${heroMediaType}/${hero.id}?demoMode=all`}
        />
      )}

      {continueWatching && continueWatching.length > 0 && (
        <ContinueWatchingRow items={continueWatching} title={t.continueWatching} />
      )}

      <ContentRow
        title={t.trendingThisWeek}
        items={trending}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />

      <ContentRow
        title={t.popularMovies}
        items={popularMovies}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />

      <ContentRow
        title={t.popularTvShows}
        items={popularTV}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />

      <ContentRow
        title={t.topRatedMovies}
        items={topRated}
        getImage={(item) => tmdb.image(item.poster_path, 'w342')}
        demoMode={true}
      />
    </div>
  );
}
