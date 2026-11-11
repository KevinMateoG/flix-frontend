'use client';

import * as React from 'react';
import { ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';
import { useDislikeStatus } from '../hooks/useLibrary';

interface DislikeButtonProps {
  profileId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DislikeButton({
  profileId,
  tmdbId,
  mediaType,
  variant = 'secondary',
  size = 'icon',
}: DislikeButtonProps) {
  const { mounted, loading, toggling, isDisliked, handleToggle } = useDislikeStatus(
    profileId,
    tmdbId,
    mediaType,
  );

  if (!mounted || loading) {
    return (
      <Button variant={variant} size={size} disabled={true} title="Dislike">
        <Loader2 size={20} className="animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggling}
      title="Dislike"
      className={isDisliked ? 'text-primary' : ''}
    >
      <ThumbsDown size={20} className={isDisliked ? 'fill-primary' : ''} />
    </Button>
  );
}
