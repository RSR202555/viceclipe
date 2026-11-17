import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/session';

// Define route matchers
const PUBLIC_PATHS = [
  '/',
  '/planos',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/checkout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static assets, images, next internal routes, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Allow explicitly public pages
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Protected admin console routes (`/admin/*`)
  if (pathname.startsWith('/admin')) {
    const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(rawCookie);

    // Rule A: Not authenticated at all -> Redirect to login
    if (!session || !session.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rule B: Authenticated, but not admin -> Redirect to app with error
    const isUserAdmin =
      session.user.is_admin === true ||
      session.user.email?.toLowerCase().endsWith('@viceclipper.com');

    if (!isUserAdmin) {
      const appUrl = new URL('/app', request.url);
      appUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(appUrl);
    }

    return NextResponse.next();
  }

  // 4. Protected internal application routes (`/app/*`)
  if (pathname.startsWith('/app')) {
    const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(rawCookie);

    // Rule A: Not authenticated at all -> Redirect to login
    if (!session || !session.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rule B: Authenticated, but accessing subscription settings (/app/assinatura) -> Always allow so user can view/renew
    if (pathname === '/app/assinatura') {
      return NextResponse.next();
    }

    // Rule C: Authenticated, but no active/valid subscription -> Redirect to plans
    if (!session.hasAccess) {
      const plansUrl = new URL('/planos', request.url);
      plansUrl.searchParams.set('error', 'subscription_required');
      plansUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(plansUrl);
    }

    // Rule D: Valid subscription and authenticated -> Allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/
     */
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
};
