import { NextRequest, NextResponse } from 'next/server';
import { getTmdbLanguage } from '@/src/features/common/config';
import { tmdb } from '@/src/features/tmdb/services/tmdb.service';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    const language = getTmdbLanguage(req.nextUrl.searchParams.get('language'));
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const data = await tmdb.search(q.trim(), 1, language);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Search API error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
