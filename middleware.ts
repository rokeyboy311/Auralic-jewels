import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('aurelia_auth_token')?.value || '';
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // If no token, redirect to home with login modal maybe, or a specialized login
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Validate token structure (basic check, backend will strictly verify)
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      
      const allowedRoles = ['admin', 'superadmin', 'atelier_staff', 'gemologist', 'master_jeweller', 'manager'];
      if (!payload.role || !allowedRoles.includes(payload.role.toLowerCase())) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
