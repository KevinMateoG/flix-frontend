import * as React from 'react';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import { MyListButton } from '@/src/features/library/components/MyListButton';
import { buildWatchUrl } from '@/src/features/playback/services/playback.service';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

interface HeroSectionProps {
  title: string;
  overview: string;
  backdropUrl: string | null;
  tmdbId: number;
  mediaType: TmdbMediaType;
  profileId?: string;
  detailsUrl?: string;
}

export function HeroSection({
  title,
  overview,
  backdropUrl,
  tmdbId,
  mediaType,
  profileId,
  detailsUrl,
}: HeroSectionProps) {
  const playUrl = buildWatchUrl(null, { tmdbId, type: mediaType });
  const resolvedDetailsUrl = detailsUrl || `/${mediaType}/${tmdbId}`;

  return (
    <section className="relative flex min-h-[70vh] w-full flex-col justify-end px-4 pt-24 pb-12 md:min-h-[85vh] md:px-12">
      {backdropUrl ? (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      ) : (
        <div className="bg-surface-container-high absolute inset-0 -z-20" />
      )}

      <div className="from-background via-background/40 absolute inset-0 -z-10 bg-gradient-to-t to-transparent" />
      <div className="from-background/90 via-background/20 absolute inset-0 -z-10 bg-gradient-to-r to-transparent" />

      <div className="z-10 flex max-w-2xl flex-col items-start gap-4">
        <span className="text-label-caps text-primary font-bold tracking-widest">
          Featured {mediaType === 'movie' ? 'Movie' : 'Series'}
        </span>
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background font-bold drop-shadow-md">
          {title}
        </h1>
        <p className="text-body-sm md:text-body-lg text-on-background/80 line-clamp-3 max-w-xl leading-relaxed drop-shadow md:line-clamp-4">
          {overview}
        </p>

        <div className="mt-4 flex w-full flex-wrap items-center gap-4 sm:w-auto">
          <Link href={playUrl} className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2">
              <Play fill="currentColor" size={20} />
              Play Now
            </Button>
          </Link>
          {profileId && (
            <MyListButton
              profileId={profileId}
              tmdbId={tmdbId}
              mediaType={mediaType}
              variant="secondary"
              size="lg"
            />
          )}
          <Link href={resolvedDetailsUrl} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="border-surface-bright bg-surface/40 w-full gap-2 backdrop-blur-md"
            >
              <Info size={20} />
              Details
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
