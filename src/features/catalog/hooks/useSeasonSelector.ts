'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { TmdbSeasonSummary } from '@/src/features/tmdb/domain/tmdb';

export function useSeasonSelector(seasons: TmdbSeasonSummary[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filteredSeasons = seasons.filter((s) => s.season_number > 0);
  const displaySeasons = filteredSeasons.length > 0 ? filteredSeasons : seasons;

  const handleSeasonChange = (seasonNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', seasonNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return {
    displaySeasons,
    handleSeasonChange,
  };
}
