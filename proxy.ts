import { NextResponse, type NextRequest } from 'next/server';

// API routes implemented by this Next.js app (app/api/**/route.ts). Never proxied.
const LOCAL_API_ROUTES = ['/api/search'];

/**
 * Forwards /api/* to the backend, reading BACKEND on every request.
 *
 * This replaces the rewrite in next.config.ts: Next.js resolves config rewrites at
 * `next build` time and bakes them into the image, so the BACKEND value passed by
 * docker-compose/Kubernetes at runtime was ignored.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLocalRoute = LOCAL_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (isLocalRoute) {
    return NextResponse.next();
  }

  const backend = process.env.BACKEND || 'http://localhost:3000';
  return NextResponse.rewrite(new URL(`${pathname}${search}`, backend));
}

export const config = {
  matcher: '/api/:path*',
};
