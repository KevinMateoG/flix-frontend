import { getTmdbLanguage } from '@/src/features/common/config';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import {
  fetchTmdbDetails,
  getPlayableMoviesForRegion,
  getUserRegion,
  isDemoModeActive,
  isTitlePlayableInRegion,
} from '@/src/features/tmdb/services/region-access.service';
import type { TmdbEpisode, TmdbMediaItem } from '@/src/features/tmdb/domain/tmdb';
import type {
  BrowsePageData,
  MovieDetailPageData,
  TvDetailPageData,
} from '../domain/catalog';

export async function getBrowsePageData(
  resolvedParams: { [key: string]: string | string[] | undefined },
): Promise<BrowsePageData> {
  const genre = (resolvedParams.genre as string) || 'all';

  const profile = await getActiveProfile();
  const configuredRegion = await getUserRegion(profile?.region);
  const region = configuredRegion || 'US';
  const language = getTmdbLanguage(profile?.language);
  const isDemo = isDemoModeActive(resolvedParams) || !configuredRegion;

  let results: TmdbMediaItem[] = [];

  try {
    if (!isDemo) {
      const playableContent = await getPlayableMoviesForRegion(region);

      const tmdbItems = await Promise.all(
        playableContent.map((item) => fetchTmdbDetails(item.tmdbId, language)),
      );

      const validItems = tmdbItems.filter(
        (item): item is TmdbMediaItem & { media_type: 'movie' | 'tv' } => item !== null,
      );

      if (genre === 'all') {
        results = validItems;
      } else {
        results = validItems.filter((item) =>
          item.genres?.some((g) => g.id.toString() === genre),
        );
      }
    } else if (genre === 'all') {
      const data = await tmdb.popular('movie', 1, region, language);
      results = data.results || [];
    } else {
      const data = await tmdb.discover(
        { with_genres: genre, region, watch_region: region },
        language,
      );
      results = data.results || [];
    }
  } catch (err) {
    console.error('Error fetching browse data:', err);
  }

  return {
    genre,
    isDemo,
    region,
    results,
  };
}

export async function getMovieDetailPageData(
  id: number,
  resolvedParams: { [key: string]: string | string[] | undefined },
): Promise<MovieDetailPageData | null> {
  const profile = await getActiveProfile();
  const configuredRegion = await getUserRegion(profile?.region);
  const region = configuredRegion || 'US';
  const language = getTmdbLanguage(profile?.language);
  const isDemo = isDemoModeActive(resolvedParams) || !configuredRegion;

  const isPlayable = await isTitlePlayableInRegion(id, configuredRegion);

  try {
    const [movie, providers] = await Promise.all([
      tmdb.movieDetails(id, language),
      tmdb.providers('movie', id),
    ]);

    if (!movie || !movie.id) return null;

    return {
      movie,
      providers: providers?.results?.[region],
      profileId: profile?.id,
      isDemo,
      isPlayable,
    };
  } catch (err) {
    console.error('Error loading movie detail:', err);
    return null;
  }
}

export async function getTvDetailPageData(
  id: number,
  resolvedParams: { [key: string]: string | string[] | undefined },
): Promise<TvDetailPageData | null> {
  const seasonParam = resolvedParams.season as string | undefined;

  const profile = await getActiveProfile();
  const configuredRegion = await getUserRegion(profile?.region);
  const region = configuredRegion || 'US';
  const language = getTmdbLanguage(profile?.language);
  const isDemo = isDemoModeActive(resolvedParams) || !configuredRegion;

  const isPlayable = await isTitlePlayableInRegion(id, configuredRegion);

  try {
    const [tv, providers] = await Promise.all([
      tmdb.tvDetails(id, language),
      tmdb.providers('tv', id),
    ]);

    if (!tv || !tv.id) return null;

    const validSeasons = tv.seasons?.filter((s) => s.season_number > 0) || [];
    const defaultSeason = validSeasons[0]?.season_number || tv.seasons?.[0]?.season_number || 1;
    const seasonNumber = seasonParam ? Number(seasonParam) : defaultSeason;

    let episodes: TmdbEpisode[] = [];
    try {
      const seasonData = await tmdb.seasonDetails(id, seasonNumber, language);
      episodes = seasonData?.episodes || [];
    } catch (err) {
      console.error(`Error loading TV season ${seasonNumber} detail:`, err);
    }

    return {
      tv,
      episodes,
      seasonNumber,
      providers: providers?.results?.[region],
      profileId: profile?.id,
      isDemo,
      isPlayable,
    };
  } catch (err) {
    console.error('Error loading TV detail:', err);
    return null;
  }
}
