import { env } from '@/src/features/common/config';
import type { WatchUrlParams } from '../domain/playback';

const DEFAULT_TEST_PLAYBACK_ID = 'demo-stream';

export function getFallbackPlaybackId(): string {
  return env.NEXT_PUBLIC_MUX_TEST_PLAYBACK_ID || DEFAULT_TEST_PLAYBACK_ID;
}

export function buildWatchUrl(
  playbackId: string | undefined | null,
  params: WatchUrlParams,
): string {
  const resolvedPlaybackId = playbackId || getFallbackPlaybackId();
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return `/watch/${resolvedPlaybackId}${query ? `?${query}` : ''}`;
}

export function extractYouTubeVideoId(playbackId: string): string | null {
  if (playbackId.startsWith('youtube:')) {
    return playbackId.slice('youtube:'.length);
  }
  if (playbackId.startsWith('youtube%3A')) {
    return playbackId.slice('youtube%3A'.length);
  }
  return null;
}

export function isValidYouTubeVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

export async function getSignedPlaybackUrl(playbackId: string): Promise<string> {
  const domain = env.NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN || 'stream.mux.com';
  return `https://${domain}/${playbackId}.m3u8`;
}
