'use client';

import { useState, useEffect } from 'react';
import { searchContentClient } from '../services/tmdb.service';
import type { TmdbMediaItem } from '../domain/tmdb';

export function useTmdbSearch(locale: string) {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<TmdbMediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const setQuery = (nextQuery: string) => {
    setQueryState(nextQuery);
    if (!nextQuery || nextQuery.trim().length < 2) {
      setResults([]);
    }
  };

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await searchContentClient(query, locale);
        setResults(items);
      } catch (err) {
        console.error('Search fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, locale]);

  return {
    query,
    setQuery,
    results,
    loading,
  };
}
