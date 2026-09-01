import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We cannot perform HttpOnly cookie checks here when the backend is on a 
  // separate domain (e.g., render.com) and the frontend is on Vercel. 
  // The browser will not send the cross-domain cookie to the Vercel edge middleware.
  // Route protection is handled strictly on the client-side via the AuthContext
  // and page-level redirects (app/admin/page.tsx, app/account/page.tsx).

  return NextResponse.next();
}

export const config = {
  // Empty matcher since we removed the logic
  matcher: [],
};
