import { NextResponse, type NextRequest } from 'next/server';
import type { AuthSession } from '@/src/features/auth/domain/auth';

// API routes implemented by this Next.js app (app/api/**/route.ts). Never proxied.
const LOCAL_API_ROUTES = ['/api/search'];

const AUTH_ROUTES = ['/login', '/register'];
const PRIVATE_ROUTES = ['/my-list', '/profile', '/settings', '/watch', '/admin'];
const ADMIN_ROUTES = ['/admin'];

function matchesRoutePrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('better-auth.session_token')?.value ||
      request.cookies.get('__Secure-better-auth.session_token')?.value,
  );
}

async function fetchSessionFromBackend(
  request: NextRequest,
  backend: string,
): Promise<AuthSession | null> {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${backend}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader,
        origin: request.nextUrl.origin,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { data?: AuthSession } & AuthSession;
    const session = (data?.data !== undefined ? data.data : data) as AuthSession | null;
    return session?.user ? session : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const backend =
    process.env.BACKEND || process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';

  if (pathname.startsWith('/api/') || pathname === '/api') {
    const isLocalRoute = matchesRoutePrefix(pathname, LOCAL_API_ROUTES);
    if (isLocalRoute) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL(`${pathname}${search}`, backend));
  }

  const isAuthRoute = matchesRoutePrefix(pathname, AUTH_ROUTES);
  const isPrivateRoute = matchesRoutePrefix(pathname, PRIVATE_ROUTES);
  const isAdminRoute = matchesRoutePrefix(pathname, ADMIN_ROUTES);

  if (!isAuthRoute && !isPrivateRoute) {
    return NextResponse.next();
  }

  const cookiePresent = hasSessionCookie(request);

  if (!cookiePresent) {
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const session = await fetchSessionFromBackend(request, backend);

  if (isAuthRoute) {
    if (session?.user) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/register',
    '/my-list/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/watch/:path*',
    '/admin/:path*',
  ],
};
