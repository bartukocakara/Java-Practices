import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/profile', '/checkout', '/cart'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth from cookie (set this on login)
  const token = request.cookies.get('token')?.value;
  const role  = request.cookies.get('role')?.value;

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAdmin     = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdmin && role !== 'ROLE_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*', '/admin/:path*', '/login', '/register'],
};