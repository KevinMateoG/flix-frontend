import { MuxPlayerComponent } from '@/src/features/playback/components/MuxPlayer';
import { YouTubePlayerComponent } from '@/src/features/playback/components/YouTubePlayer';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

interface WatchViewProps {
  playbackId: string;
  youtubeVideoId: string | null;
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  posterPath: string;
  seasonNumber?: number;
  episodeNumber?: number;
  initialTime: number;
  backUrl: string;
}

export function WatchView({
  playbackId,
  youtubeVideoId,
  profileId,
  tmdbId,
  mediaType,
  title,
  posterPath,
  seasonNumber,
  episodeNumber,
  initialTime,
  backUrl,
}: WatchViewProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {youtubeVideoId ? (
        <YouTubePlayerComponent
          videoId={youtubeVideoId}
          profileId={profileId}
          tmdbId={tmdbId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          initialTime={initialTime}
          backUrl={backUrl}
        />
      ) : (
        <MuxPlayerComponent
          playbackId={playbackId}
          profileId={profileId}
          tmdbId={tmdbId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          initialTime={initialTime}
          backUrl={backUrl}
        />
      )}
    </div>
  );
}
