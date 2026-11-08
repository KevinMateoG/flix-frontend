import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import type { MovieDetailPageData } from '../domain/catalog';
import { CastCrew } from './CastCrew';
import { ContentDetail } from './ContentDetail';
import { ContentRow } from './ContentRow';

export function MovieDetailView({
  movie,
  providers,
  profileId,
  isDemo,
  isPlayable,
}: MovieDetailPageData) {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={movie}
        mediaType="movie"
        providers={providers}
        tmdb={tmdb}
        profileId={profileId}
        showPlayButton={isDemo || isPlayable}
      />
      <CastCrew cast={movie.credits?.cast || []} tmdb={tmdb} />
      {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
        <ContentRow
          title="Similar Titles"
          items={movie.recommendations.results}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
          demoMode={isDemo}
        />
      )}
    </div>
  );
}
