import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase';

const protectedRoutes = ['/dashboard', '/admin', '/account', '/favorites'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Always refresh the session first
  const response = await updateSession(request, NextResponse.next({ request }));

  // Only check auth for specific protected routes
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
    
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};