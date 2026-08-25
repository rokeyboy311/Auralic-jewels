import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Route with quick role check if cookie exists
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('aurelic_auth_token')?.value;

    // Allow login path
    if (pathname === '/admin/login' || pathname === '/login') {
      return NextResponse.next();
    }

    // In Next.js middleware, if no auth token is present, redirect to customer login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
