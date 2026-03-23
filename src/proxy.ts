import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware
 *
 * Keeps this dashboard private/admin-only.
 * Uses HTTP Basic Auth. Set ADMIN_PASSWORD in .env.
 *
 * For a harder lock, replace this with an IP allowlist or
 * a proper session-based auth (NextAuth.js) in the future.
 */
export function proxy(request: NextRequest) {
  // Skip auth check for the API callback routes — Meta/Google redirect here
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/api/connect') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  // If no password set, allow access in dev (warn loudly)
  if (!adminPassword) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Auth] ADMIN_PASSWORD is not set. Blocking all access in production.');
      return new NextResponse('Unauthorized – ADMIN_PASSWORD not configured.', { status: 401 });
    }
    console.warn('[Auth] ADMIN_PASSWORD not set — allowing open access in development.');
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const [, password] = decoded.split(':');
      if (password === adminPassword) {
        return NextResponse.next();
      }
    }
  }

  // Prompt browser for Basic Auth credentials
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="MCP SocialPulse Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
