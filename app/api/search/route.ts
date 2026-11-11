import { NextRequest, NextResponse } from 'next/server';
import { getTmdbLanguage } from '@/src/features/common/config';
import { tmdbCatalog } from '@/src/features/tmdb/services/tmdb-catalog.service';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const language = getTmdbLanguage(req.nextUrl.searchParams.get('language'));
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Routed through the backend so titles deactivated by an admin are excluded.
  const data = await tmdbCatalog.search(q.trim(), 1, language);
  return NextResponse.json(data);
}
