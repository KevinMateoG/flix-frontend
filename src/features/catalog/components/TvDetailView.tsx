import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import type { TvDetailPageData } from '../domain/catalog';
import { CastCrew } from './CastCrew';
import { ContentDetail } from './ContentDetail';
import { ContentRow } from './ContentRow';
import { EpisodeList } from './EpisodeList';
import { SeasonSelector } from './SeasonSelector';

export function TvDetailView({
  tv,
  episodes,
  seasonNumber,
  providers,
  profileId,
  isDemo,
  isPlayable,
}: TvDetailPageData) {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <ContentDetail
        item={tv}
        mediaType="tv"
        providers={providers}
        tmdb={tmdb}
        profileId={profileId}
        showPlayButton={isDemo || isPlayable}
      />

      {tv.seasons && tv.seasons.length > 0 && (
        <>
          <SeasonSelector seasons={tv.seasons} currentSeason={seasonNumber} />
          <EpisodeList
            episodes={episodes}
            tmdbId={tv.id}
            seasonNumber={seasonNumber}
            profileId={profileId}
            tmdb={tmdb}
            videos={tv.videos?.results || []}
            showPlayButton={isDemo || isPlayable}
          />
        </>
      )}

      <CastCrew cast={tv.credits?.cast || []} tmdb={tmdb} />

      {tv.recommendations?.results && tv.recommendations.results.length > 0 && (
        <ContentRow
          title="Similar Titles"
          items={tv.recommendations.results}
          getImage={(item) => tmdb.image(item.poster_path, 'w342')}
          demoMode={isDemo}
        />
      )}
    </div>
  );
}
