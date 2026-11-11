import { redirect } from 'next/navigation';
import { getTmdbLanguage } from '@/src/features/common/config';
import { WatchView } from '@/src/features/history/components/WatchView';
import { getSeasonWatchHistory } from '@/src/features/history/services/history.service';
import {
  extractYouTubeVideoId,
  isValidYouTubeVideoId,
} from '@/src/features/playback/services/playback.service';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';
import { tmdbCatalog } from '@/src/features/tmdb/services/tmdb-catalog.service';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tmdbId: string; type: string; season?: string; episode?: string }>;
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id: rawPlaybackId } = await params;
  const playbackId = decodeURIComponent(rawPlaybackId);
  const { tmdbId, type, season, episode } = await searchParams;

  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/login');
  }
  const language = getTmdbLanguage(profile.language);

  if (!tmdbId || !type) {
    redirect('/home');
  }

  const isTv = type === 'tv';
  const backUrl = isTv ? `/tv/${tmdbId}${season ? `?season=${season}` : ''}` : `/movie/${tmdbId}`;

  const youtubeVideoId = extractYouTubeVideoId(playbackId);

  if (youtubeVideoId && !isValidYouTubeVideoId(youtubeVideoId)) {
    redirect(backUrl);
  }

  const seasonNum = season ? Number(season) : 0;
  const epNum = episode ? Number(episode) : 0;

  let initialTime = 0;
  try {
    const history = await getSeasonWatchHistory(Number(tmdbId), seasonNum);
    const match = history.find((row) => row.episodeNumber === epNum);
    if (match) {
      initialTime = match.progressSeconds || 0;
    }
  } catch (err) {
    console.error('Error fetching initial watch progress:', err);
  }

  let title = 'Video';
  let posterPath = '';

  if (!isTv) {
    // Deactivated movies (admin) are not watchable: the backend returns 404 for them.
    const movie = await tmdbCatalog.movieDetails(Number(tmdbId), language);
    if (!movie) {
      redirect('/home');
    }
    title = movie.title || 'Movie';
    posterPath = movie.poster_path || '';
  }

  try {
    if (isTv) {
      const show = await tmdb.tvDetails(Number(tmdbId), language);
      title = `${show.name || 'TV Show'} (S${seasonNum}:E${epNum})`;
      posterPath = show.poster_path || '';
    }
  } catch (err) {
    console.error('Error fetching watch details:', err);
  }

  return (
    <WatchView
      playbackId={playbackId}
      youtubeVideoId={youtubeVideoId}
      profileId={profile.id}
      tmdbId={Number(tmdbId)}
      mediaType={type as TmdbMediaType}
      title={title}
      posterPath={posterPath}
      seasonNumber={seasonNum}
      episodeNumber={epNum}
      initialTime={initialTime}
      backUrl={backUrl}
    />
  );
}
