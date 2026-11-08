import { getMessages, getTmdbLanguage } from '@/src/features/common/config';
import { getContinueWatching } from '@/src/features/history/services/history.service';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import {
  fetchTmdbDetails,
  getPlayableMoviesForRegion,
  isDemoModeActive,
} from '@/src/features/tmdb/services/region-access.service';
import type { TmdbMediaItem } from '@/src/features/tmdb/domain/tmdb';
import type { HomePageData } from '../domain/home';

export async function getHomePageData(
  resolvedParams: { [key: string]: string | string[] | undefined },
): Promise<HomePageData> {
  const profile = await getActiveProfile();
  const region = profile?.region || 'US';
  const language = getTmdbLanguage(profile?.language);
  const messages = getMessages(profile?.language);

  const isDemo = isDemoModeActive(resolvedParams);
  const continueWatching = profile ? await getContinueWatching(profile.id) : [];

  if (!isDemo) {
    const playableContent = await getPlayableMoviesForRegion(region);

    if (playableContent.length === 0) {
      return {
        isDemo: false,
        region,
        profileId: profile?.id,
        messages,
        continueWatching,
        hero: null,
        regionalItems: [],
        trending: [],
        popularMovies: [],
        popularTV: [],
        topRated: [],
      };
    }

    const tmdbItems = await Promise.all(
      playableContent.map((item) => fetchTmdbDetails(item.tmdbId, language)),
    );

    const validItems = tmdbItems.filter(
      (item): item is TmdbMediaItem & { media_type: 'movie' | 'tv' } => item !== null,
    );
    const hero = validItems.find((r) => r.backdrop_path) || validItems[0] || null;

    return {
      isDemo: false,
      region,
      profileId: profile?.id,
      messages,
      continueWatching,
      hero,
      regionalItems: validItems,
      trending: [],
      popularMovies: [],
      popularTV: [],
      topRated: [],
    };
  }

  const [trending, popularMovies, popularTV, topRated] = await Promise.all([
    tmdb.trending('all', 'week', language),
    tmdb.popular('movie', 1, region, language),
    tmdb.popular('tv', 1, region, language),
    tmdb.topRated('movie', 1, region, language),
  ]);

  const hero =
    trending.results?.find((r) => r.media_type === 'movie' && r.backdrop_path) ||
    trending.results?.[0] ||
    null;

  return {
    isDemo: true,
    region,
    profileId: profile?.id,
    messages,
    continueWatching,
    hero,
    regionalItems: [],
    trending: trending.results?.slice(0, 15) || [],
    popularMovies: popularMovies.results?.slice(0, 15) || [],
    popularTV: popularTV.results?.slice(0, 15) || [],
    topRated: topRated.results?.slice(0, 15) || [],
  };
}
