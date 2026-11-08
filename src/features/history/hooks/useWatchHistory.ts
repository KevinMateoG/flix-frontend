'use client';

import { useCallback } from 'react';
import { updateWatchProgress } from '../services/history.service';
import type { WatchProgressInput } from '../domain/history';

export function useWatchHistory() {
  const reportProgress = useCallback(async (input: WatchProgressInput) => {
    try {
      await updateWatchProgress(input);
    } catch (err) {
      console.error('Error reporting watch progress:', err);
    }
  }, []);

  return { reportProgress };
}
