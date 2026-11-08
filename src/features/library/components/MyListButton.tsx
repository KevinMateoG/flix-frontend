'use client';

import * as React from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';
import { useMyListItemStatus } from '../hooks/useLibrary';

interface MyListButtonProps {
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function MyListButton({
  profileId,
  tmdbId,
  mediaType,
  variant = 'secondary',
  size = 'lg',
}: MyListButtonProps) {
  const { mounted, loading, toggling, isInList, handleToggle } = useMyListItemStatus(
    profileId,
    tmdbId,
    mediaType,
  );

  if (!mounted || loading) {
    return (
      <Button variant={variant} size={size} disabled={true} className="gap-2">
        <Loader2 size={20} className="animate-spin" />
        List
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggling}
      className="gap-2"
    >
      {isInList ? (
        <>
          <Check size={20} className="text-primary" />
          In My List
        </>
      ) : (
        <>
          <Plus size={20} />
          My List
        </>
      )}
    </Button>
  );
}
