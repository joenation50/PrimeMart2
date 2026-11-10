// middleware.ts
// Route gate + session refresh. Runs on every request.

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase';

const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/password-reset',
  '/auth/callback',
  '/terms',
  '/privacy',
  '/about',
  '/maintenance',
  '/admin/login',
];

const publicPrefixes = [
  '/listing/',
  '/seller/',
  '/verified-sellers',
];

const protectedPrefixes = [
  '/account',
  '/favorites',
  '/notifications',
  '/dashboard',
  '/listings',
  '/paywall',
  '/renew',
];

const adminPrefixes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const response = NextResponse.next({ request });
  const refreshed = await updateSession(request, response);
  
  const isPublicExact = publicRoutes.includes(pathname);
  const isPublicPrefix = publicPrefixes.some((p) => pathname.startsWith(p));
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  const isAdmin = adminPrefixes.some((p) => pathname.startsWith(p)) && pathname !== '/admin/login';
  
  // Allow public routes
  if (isPublicExact || isPublicPrefix) {
    return refreshed;
  }
  
  // Check session for protected routes
  if (isProtected || isAdmin) {
    const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
    
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? '/admin/login' : '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return refreshed;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};