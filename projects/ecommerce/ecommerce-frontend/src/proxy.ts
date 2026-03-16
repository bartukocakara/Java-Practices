import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VENDOR_ROUTES  = ['/vendor'];
const ADMIN_ROUTES   = ['/admin'];
const PROTECTED      = ['/profile', '/checkout', '/cart'];
const AUTH_ROUTES    = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token  = request.cookies.get('token')?.value;
  const role   = request.cookies.get('role')?.value;

  const isVendor    = VENDOR_ROUTES.some(r => pathname.startsWith(r));
  const isAdmin     = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  const isProtected = PROTECTED.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // Apply page is public (for logged-in users)
  if (pathname === '/vendor/apply') return NextResponse.next();

  if ((isProtected || isVendor || isAdmin) && !token)
    return NextResponse.redirect(new URL('/login', request.url));

  if (isAdmin && role !== 'ROLE_ADMIN')
    return NextResponse.redirect(new URL('/', request.url));

  if (isVendor && role !== 'ROLE_VENDOR' && role !== 'ROLE_ADMIN')
    return NextResponse.redirect(new URL('/vendor/apply', request.url));

  if (isAuthRoute && token)
    return NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*', '/checkout/:path*', '/cart',
    '/vendor/:path*',  '/admin/:path*',
    '/login',          '/register',
  ],
};