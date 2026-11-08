'use client';

import * as React from 'react';
import {
  checkIfDisliked,
  checkIfInMyList,
  removeFromMyList,
  toggleDislike,
  toggleMyList,
} from '../services/library.service';
import type { TmdbMediaType } from '@/src/features/tmdb/domain/tmdb';

export function useMyListItemStatus(
  profileId: string,
  tmdbId: number,
  mediaType: TmdbMediaType,
) {
  const [isInList, setIsInList] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function check() {
      try {
        const result = await checkIfInMyList({ profileId, tmdbId, mediaType });
        if (active) {
          setIsInList(result);
          setMounted(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking list:', err);
        if (active) {
          setMounted(true);
          setLoading(false);
        }
      }
    }
    void check();
    return () => {
      active = false;
    };
  }, [profileId, tmdbId, mediaType]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (toggling) return;
    setToggling(true);
    try {
      const res = await toggleMyList({ profileId, tmdbId, mediaType });
      setIsInList(res.added);
    } catch (err) {
      console.error('Error toggling list:', err);
    } finally {
      setToggling(false);
    }
  };

  return {
    mounted,
    loading,
    toggling,
    isInList,
    handleToggle,
  };
}

export function useDislikeStatus(
  profileId: string,
  tmdbId: number,
  mediaType: TmdbMediaType,
) {
  const [isDisliked, setIsDisliked] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function check() {
      try {
        const result = await checkIfDisliked({ profileId, tmdbId, mediaType });
        if (active) {
          setIsDisliked(result);
          setMounted(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking dislike:', err);
        if (active) {
          setMounted(true);
          setLoading(false);
        }
      }
    }
    void check();
    return () => {
      active = false;
    };
  }, [profileId, tmdbId, mediaType]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (toggling) return;
    setToggling(true);
    try {
      const res = await toggleDislike({ profileId, tmdbId, mediaType });
      setIsDisliked(res.added);
    } catch (err) {
      console.error('Error toggling dislike:', err);
    } finally {
      setToggling(false);
    }
  };

  return {
    mounted,
    loading,
    toggling,
    isDisliked,
    handleToggle,
  };
}

export function useMyListCardActions(id: number, href: string, title: string) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  async function handleRemove() {
    if (removing) return;

    setRemoving(true);
    try {
      await removeFromMyList(id);
    } catch (error) {
      console.error('Error removing from my list:', error);
      setRemoving(false);
    }
  }

  async function handleShare() {
    const url = new URL(href, window.location.origin).toString();
    const shareData = { title, text: title, url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        console.error('Error sharing title:', error);
      }
    }
  }

  return {
    menuOpen,
    setMenuOpen,
    removing,
    copied,
    handleRemove,
    handleShare,
  };
}
